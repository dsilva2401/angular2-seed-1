// External modules
	var markdownpdf = function () { return require("markdown-pdf") };
	var stringify = require("json-stringify-pretty-compact")
	var gulp = require('gulp-param')(require('gulp'), process.argv);
	var git = require('gulp-git');
	var shell = require('shelljs');
	var path = require('path');
	var open = require('open');
	var runSequence = require('run-sequence');
	var typedoc = require('gulp-typedoc');
	var ts = require('gulp-typescript');
	var package = require('./package.json');
	var tsconfig = require('./tsconfig.json');
	var fs = require('fs-extra');
	var webpack = require('gulp-webpack');
	var httpRoutes = require('./src/settings/http-routes.json');
	var webapps = require('./src/settings/webapps.json');
	var replace = require("replace");
	var inquirer = require('inquirer');
	var tickets = require('./tickets/tickets.json');
	var underscore = require('underscore');

/**
 * Items
 */

	// Dependencies
		gulp.task('typings:install', function(module, global, dt) {
			if (!module) {
				shell.exec('node_modules/.bin/typings install');
			} else {
				shell.exec(
					'node_modules/.bin/typings install '+
					(dt ? 'dt~' : '')+
					module+' --save'+
					(global ? ' --global' : '')
				);
			}
		});

		gulp.task('typings:search', function(module) {
			if (!module) return;
			shell.exec('node_modules/.bin/typings search '+module);
		});

		gulp.task('typings:uninstall', function(module) {
			if (!module) return;
			shell.exec(
				'node_modules/.bin/typings uninstall '+module+' --save'+
				(global ? ' --global' : '')
			);
		});

	// Docs
		gulp.task('docs:build', function () {
			return gulp
        	.src(['src/**/*.ts', 'typings/**/*.ts'])
        	.pipe(typedoc({
				module: (tsconfig.module || 'commonjs'),
				target: (tsconfig.target || 'es5'),
				out: './wiki',
				name: package.name,
				media: './media'
			}));
		});
		gulp.task('docs:show', function () {
			open( path.join(__dirname, 'wiki/index.html') );
		});

	// Webapps
		var webappsDir = 'src/setup/webapps/src';
		var webappsEntries = fs.readdirSync(path.join(__dirname, webappsDir));
		webappsEntries = webappsEntries.filter(function (entry) {
			var ignore = [
				'.DS_Store',
				'ang',
				'.seed-webapp'
			];
			for (var i=0; i<ignore.length; i++) {
				if (ignore[i] == entry) return;
			}
			return entry;
		})
		webappsEntries.forEach(function (entryName) {
			var entryPath = path.join(__dirname, webappsDir, entryName);
			gulp.task('webapp['+entryName+']:build', function () {
				shell.exec('sh -c \'cd '+entryPath+' src && webpack\'');
			});
			gulp.task('webapp['+entryName+']:install', function () {
				shell.exec('sh -c \'cd '+entryPath+' src && npm install\'');
			});
			gulp.task('webapp['+entryName+']:setup:dev', function () {
				fs.copySync(
					path.join(entryPath, 'src/index.dev.html'),
					path.join(entryPath, 'src/index.html')
				);
				return;
			});
			gulp.task('webapp['+entryName+']:setup:prod', function () {
				fs.copySync(
					path.join(entryPath, 'src/dist'),
					path.join(entryPath, 'src/dist-prod')
				);
				fs.copySync(
					path.join(entryPath, 'src/index.prod.html'),
					path.join(entryPath, 'src/index.html')
				);
				return;
			});
			gulp.task('webapp['+entryName+']:setup:test', function () {
				fs.copySync(
					path.join(entryPath, 'src/dist'),
					path.join(entryPath, 'src/dist-test')
				);
				fs.copySync(
					path.join(entryPath, 'src/index.test.html'),
					path.join(entryPath, 'src/index.html')
				);
				return;
			});
		});
		gulp.task('webapps:build', function () {
			runSequence(webappsEntries.map(function (entryName) {
				return 'webapp['+entryName+']:build';
			}));
		});
		gulp.task('webapps:install', function () {
			runSequence(webappsEntries.map(function (entryName) {
				return 'webapp['+entryName+']:install';
			}));
		});
		gulp.task('webapps:setup:dev', function () {
			runSequence(webappsEntries.map(function (entryName) {
				return 'webapp['+entryName+']:setup:dev';
			}));
		});
		gulp.task('webapps:setup:test', function () {
			runSequence(webappsEntries.map(function (entryName) {
				return 'webapp['+entryName+']:setup:test';
			}));
		});
		gulp.task('webapps:setup:prod', function () {
			runSequence(webappsEntries.map(function (entryName) {
				return 'webapp['+entryName+']:setup:prod';
			}));
		});
		gulp.task('webapps:new', function (name) {
			if (!name) return;
			var seedWebappPath = path.join(__dirname, 'src/setup/webapps/src/.seed-webapp'); 
			var webappPath = path.join(__dirname, 'src/setup/webapps/src/'+name); 
			fs.copySync(seedWebappPath, webappPath);
			replace({
				regex: 'REPLACE',
				replacement: name,
				paths: [path.join(webappPath, 'src/index.html')],
				recursive: false,
				silent: false,
			});
			console.log('Installing webapp dependencies');
			shell.exec('sh -c \'cd '+webappPath+' src && npm install\'');
			console.log('Webapp created..');
		});
		gulp.task('webapps:shared:update', function () {
			var webapps = fs.readdirSync(path.join(__dirname, 'src/setup/webapps/src'));
			var sharedWebappPackage = require(path.join(__dirname, 'src/setup/webapps/src/.shared/package.json'));
			var sharedPath = path.join(__dirname, 'src/setup/webapps/src/.shared/src/app/shared');
			webapps.forEach(function (webapp) {
				if (webapp == '.shared') return;
				var webappPath = path.join(__dirname, 'src/setup/webapps/src', webapp);
				var webappSharedPath = path.join(webappPath, 'src/app/shared');
				try {
					var currentWebappPackage = require(path.join(webappPath, 'package.json'))
					// Updating shared files
						fs.removeSync(webappSharedPath);
						fs.copySync(sharedPath, webappSharedPath);
					// Syncing package dependencies
						var depsDiff = underscore.difference(
							Object.keys(sharedWebappPackage.dependencies),
							Object.keys(currentWebappPackage.dependencies)
						);
						if (depsDiff.length) {
							console.log('Syncing '+webapp+' dependencies: '+depsDiff.join(', '));
							depsDiff.forEach(function (dep) {
								currentWebappPackage.dependencies[dep] = sharedWebappPackage.dependencies[dep];
							});
							fs.writeFileSync(
								path.join(webappPath, 'package.json'),
								stringify(currentWebappPackage)
							)
							if (webapp != '.seed-webapp') {
								gulp.start('webapp['+webapp+']:install');
							}
						}
					// Syncing package dev dependencies
						var devDepsDiff = underscore.difference(
							Object.keys(sharedWebappPackage.devDependencies),
							Object.keys(currentWebappPackage.devDependencies)
						);
						if (devDepsDiff.length) {
							console.log('Syncing '+webapp+' dev dependencies: '+devDepsDiff.join(', '));
							devDepsDiff.forEach(function (dep) {
								currentWebappPackage.devDependencies[dep] = sharedWebappPackage.devDependencies[dep];
							});
							fs.writeFileSync(
								path.join(webappPath, 'package.json'),
								stringify(currentWebappPackage)
							)
							if (webapp != '.seed-webapp') {
								gulp.start('webapp['+webapp+']:install');
							}
						}
				} catch (err) {
					console.log('Error!', err);
				}
			});
			console.log('Webapps shared updated!');
		})

	// Servers
		var servers = ['proxy', 'api', 'auth', 'statics', 'webapps', 'bgServer'];
		servers.forEach(function (server) {
			gulp.task('start:'+server, function () {
				require('./dist/'+server+'.bundle.js');
			});
		});
		gulp.task('servers:setup:dev', function () {
			return fs.copySync('src/config.dev.ts', 'src/config.ts');
		});
		gulp.task('servers:setup:test', function () {
			return fs.copySync('src/config.test.ts', 'src/config.ts');
		});
		gulp.task('servers:setup:prod', function () {
			return fs.copySync('src/config.prod.ts', 'src/config.ts');
		});
		gulp.task('servers:build', function () {
			return shell.exec('node_modules/.bin/webpack');
		});
		gulp.task('servers:start', function () {
			runSequence(servers.map(function (serverName) {
				return 'start:'+serverName;
			}));
		})

	// Tests
		gulp.task('tests:build', function () {
			fs.ensureDirSync('test/project-src');
			fs.copy('src/settings', 'test/project-src/settings');
			var tsProject = ts.createProject('tsconfig.json');
			return tsProject.src('src/config.ts')
				.pipe(ts(tsProject)).js
				.pipe(gulp.dest('test/project-src'));
		});
	

	// Tickets
		var jsonToHTML = function (jsonObject) {
			var listToHTML = function (list) {
				if (typeof list == 'string') return list;
				var html = '<ul>';
				for (var i=0; i<list.length; i++) {
					html += '<li>'+list[i]+'</li>';
				}
				html += '</ul>';
				return html;
			} 
			var html = '<table>';
			Object.keys(jsonObject).forEach(function (key) {
				html += '<tr><th>'+key+'</th><td>'+listToHTML(jsonObject[key])+'</td></tr>';
			});
			html += '</table>';
			return html;
		}
		var setupTicketFiles = function (files) {
			files.forEach(function (file) {
				try { fs.accessSync(file.path, fs.F_OK); } catch (err) {
					var fpath = path.join(process.cwd(), file.path); 
					// Is dir
					if (file.dir) {
						console.log('Creating dir', fpath);
						fs.mkdirSync(fpath);
					}
					// Is file
					else {
						console.log('Creating file', file.path);
						fs.writeFileSync(file.path, file.content);
					}
				}
			});
		}
		var generateServiceTicketMarkdown = function (ticket) {
			var finalTicket = {};
			finalTicket['Type'] = 'Services';
			finalTicket['ID'] = ticket.id;
			finalTicket['Name'] = ticket.name;
			finalTicket['Description'] = ticket.fullDescription || ticket.description;
			finalTicket['Branch'] = ticket.branch;
			// Handler and interfaces
			finalTicket['Involved files'] = [
				path.join(ticket.handlerPath, 'index.ts'),
				path.join(ticket.handlerPath, 'interfaces.ts'),
				path.join(ticket.handlerPath, '..', 'index.ts'),
				'src/settings/http-routes.json (readonly)'
			];
			// Tests
			finalTicket['Involved files'].push(ticket.testsPath);
			finalTicket['Involved files'].push(path.join(ticket.testsPath, '..', 'index.js'));
			// Models
			ticket.models.forEach(function (modelName) {
				finalTicket['Involved files'].push('src/core/db-models/'+modelName+'.ts (readonly)');
			});
			// Transactions
			ticket.models.forEach(function (modelName) {
				finalTicket['Involved files'].push('src/core/db-transactions/'+modelName+'.ts');
			});
			// Services
			ticket.services.forEach(function (serviceName) {
				finalTicket['Involved files'].push('src/core/services/'+serviceName+'.ts (readonly)');
			});
			finalTicket['Involved Models'] = 'May use models '+ticket.models.join(', ');
			finalTicket['Involved Transactions'] = 'May use transactions from '+ticket.models.join(', ');
			finalTicket['Tests'] = ticket.tests.map(function (t) {
				return t.scenario+' (status: '+t.status+')';
			});
			var markdownContent = 'Service Ticket\n===============\n\n';
			markdownContent += 'Before anything change this ticket to \`In Progress\` stage and asign it to you in <a href="https://trello.com/b/JQUXIBa4/screens-dev">trello</a>';
			markdownContent += '\n\n'+jsonToHTML(finalTicket)+'\n\n';
			markdownContent += '\n\n## Fields Legend\n\n';
			markdownContent += '- Description: Goal to achieve with this service\n';
			markdownContent += '- Branch: Git branch where ticket should be implemented\n';
			markdownContent += '- Involved files: List of the files involved in the development of this service, some of this files may be readonly\n';
			markdownContent += '- Involved db-transactions: List of useful transactions\n';
			markdownContent += '- Involved db-models: List of useful models used\n';
			markdownContent += '- Tests: Tests that service should pass\n';
			markdownContent += '\n\n\nTo view ticket again you can use `gulp tickets:view`\n\n\n';
			markdownContent += '\n\n## On Finish\n\n';
			markdownContent += 'To deploy ticket type \`gulp deploy:ticket\`. ';
			markdownContent += 'Don\'t forget to create a pull request on <a href="https://bitbucket.org/screens-adv/server/pull-requests/">bitbucket</a> ';
			markdownContent += 'and in <a href="https://trello.com/b/JQUXIBa4/screens-dev">trello</a> move your ticket to \`Testing\` stage';
			var outputPDFPath = path.join(process.cwd()+'/tickets/current-ticket.pdf');
			markdownpdf()().from.string(markdownContent).to(outputPDFPath, function () {
				open('file://'+outputPDFPath);
			});
		}
		gulp.task('tickets:view', function () {
			inquirer.prompt([
				{
					type: 'input',
					name: 'id',
					message: 'Ticket ID'
				}
			]).then(function (answers) {
				var ticket = (tickets[answers.id.split('-')[0]] || []).filter(function (s) { return s.id==answers.id; })[0];
				if (!ticket) return console.log('Invalid ticket');
				generateServiceTicketMarkdown(ticket);
			});
		});
		gulp.task('tickets:create', function () {
			inquirer.prompt([
				{
					type: 'list',
					name: 'type',
					message: 'Type of ticket',
					choices: Object.keys(tickets)
				}
			]).then(function (answers) {
				var currentTicketType = answers.type; 
				switch (answers.type) {
					case 'services':
						inquirer.prompt([
							{
								type: 'input',
								name: 'name',
								message: 'Service Name'
							}, {
								type: 'input',
								name: 'description',
								message: 'Service Basic Description'
							}, {
								type: 'input',
								name: 'fullDescription',
								message: 'Service Full Description'
							}, {
								type: 'input',
								name: 'handlerDir',
								message: 'Handler Dir'
							}, {
								type: 'checkbox',
								name: 'models',
								message: 'Involved Models',
								choices: fs.readdirSync(process.cwd()+'/src/core/db-models').map(function (m) { return m.split('.')[0] })
							}, {
								type: 'checkbox',
								name: 'services',
								message: 'Involved Services',
								choices: fs.readdirSync(process.cwd()+'/src/core/services').map(function (m) { return m.split('.')[0] })
							}, {
								type: 'input',
								name: 'tests',
								message: 'Tests scenarios (description, status)'
							}
						]).then(function (answers) {
							var tests = (answers.tests || '')
							// Get matching tests
							tests = tests.match(/\([A-Za-z0-9\s]+[\s]*\,[\s]*[0-9]+[\s]*\)/g)
							// Map result
							tests = (tests || []);
							tests = tests.map(function (t) {
								return {
									scenario: t.substring(1, t.length).replace(/^\s+/, '').replace(/,[a-zA-Z0-9\s\)]+/g, '').replace(/\s+$/, ''),
									status: parseInt(t.substring(t.indexOf(',')+1, t.length).match(/[0-9]+/)[0])
								}
							});
							var nameCamelCase = answers.name[0].toUpperCase()+answers.name.substring(1, answers.name.length);
							tickets.services.push({
								id: currentTicketType+'-'+answers.name.toLowerCase(),
								name: answers.name,
								branch: currentTicketType+'-'+answers.name.toLowerCase(),
								description: answers.description,
								fullDescription: answers.fullDescription,
								models: answers.models,
								services: answers.services,
								testsPath: path.join('test/specs/http-services/api/', answers.handlerDir, answers.name+'.js'),
								handlerPath: path.join('src/setup/api/routers/handling', answers.handlerDir, nameCamelCase),
								timestamp: Date.now(),
								tests: tests
							});
							var ticket = tickets.services[tickets.services.length-1];
							setupTicketFiles([
								{
									dir: false,
									path: ticket.testsPath,
									content: fs.readFileSync(
										path.join(process.cwd(), '/.src-seeds/http-service.js'),
										'utf-8'
									).replace('_NAME_', ticket.name).replace('_DESCRIPTION_', ticket.description)
								}, {
									dir: true,
									path: ticket.handlerPath
								}, {
									dir: false,
									path: path.join(ticket.handlerPath, 'index.ts'),
									content: fs.readFileSync(
										path.join(process.cwd(), '/.src-seeds/handler.ts'),
										'utf-8'
									).replace('_NAMECAMEL_', nameCamelCase)
								}, {
									dir: false,
									path: path.join(ticket.handlerPath, 'interfaces.ts'),
									content: fs.readFileSync(
										path.join(process.cwd(), '/.src-seeds/handler-interfaces.ts'),
										'utf-8'
									)
								}
							]);
							fs.writeFileSync(process.cwd()+'/tickets/tickets.json', stringify(tickets));
							console.log('Service Created..');
							console.log( stringify(ticket) );
						});
					break;
				}
			});
		})


/**
 * Global actions
 */

	// Build
		gulp.task('build', function () {
			runSequence([
				'servers:build',
				'webapps:build'
			]);
		});
	
	// Test
		gulp.task('test', ['tests:build'], function () {
			shell.exec('node_modules/.bin/mocha -t 30000 --reporter spec test/**/*.spec.js');
		});
		gulp.task('exec:mocha', function () {
			shell.exec('node_modules/.bin/mocha -t 50000 --reporter spec test/**/*.spec.js');
		})
		gulp.task('test:remote', function () {
			runSequence([
				'servers:setup:test',
				'tests:build',
				'exec:mocha'
			]);
		});
	
	// Setups
		gulp.task('setup:dev', function () {
			runSequence([
				'servers:setup:dev',
				'webapps:setup:dev'
			]);
		});
		gulp.task('setup:test', function () {
			runSequence([
				'servers:setup:test',
				'webapps:setup:test'
			]);
		});
		gulp.task('setup:prod', function () {
			runSequence([
				'servers:setup:prod',
				'webapps:setup:prod'
			]);
		});
	
	// Serve
		gulp.task('serve', function (build, buildAll) {
            fs.removeSync(__dirname);
			var sequence = [];
			if (build || buildAll) {
				sequence.push('servers:setup:dev');
				sequence.push('servers:build');
			}
			if (buildAll) {
				sequence.push('webapps:setup:dev');
				sequence.push('webapps:build');
			}
			sequence.push('servers:start');
			runSequence(sequence);
		});
	
	// Init
		gulp.task('init', function () {
			console.log('Creating and switching to dev branch');
			git.checkout('dev', {args:'-b'}, function (err) {
				if (err) return console.error(err);
				runSequence([
					'typings:install',
					'webapps:install',
					'setup:dev',
					'build'
				]);
			});
		});

	// Setup dev env for a ticket 
		gulp.task('setup:dev:ticket', function () {
			git.revParse({args:'--abbrev-ref HEAD'}, function (err, branch) {
				if (err) return console.error(err);
				if (branch != 'dev') return console.warn('Please change to "dev" branch to setup environment');
				inquirer.prompt([
					{
						type: 'input',
						name: 'id',
						message: 'Ticket ID'
					}
				]).then(function (answers) {
					var ticket = (tickets[answers.id.split('-')[0]] || []).filter(function (s) { return s.id==answers.id; })[0];
					if (!ticket) return console.log('Invalid ticket');
					console.log('Setting up environment for '+answers.type+' ticket: '+ticket.id);
					console.log('Switching to branch '+ticket.branch);
					git.checkout(ticket.branch, {args:'-b'}, function (err) {
						if (err) {
							git.checkout(ticket.branch, {}, function (err) {
								if (err) return console.error(err);
								console.log('Opening ticket..');
								generateServiceTicketMarkdown(ticket);
							})
						} else {
							console.log('Opening ticket..');
							generateServiceTicketMarkdown(ticket);
						}
					});
				});
			});
		});
	
	// Deploy a ticket
		gulp.task('deploy:ticket', function () {
			git.status({args: '--porcelain'}, function (err, stdout) {
				if (err) return console.error(err);
				if (stdout.length) return console.warn('Please commit your changes before deploying');
				git.revParse({args:'--abbrev-ref HEAD'}, function (err, branch) {
					if (err) return console.error(err);
					var ticket = (tickets[branch.split('-')[0]] || []).filter(function (s) { return s.id==branch; })[0];
					if (!ticket) return console.warn('Working on invalid branch, no ticket for current branch');
					git.push('origin', branch, function (err) {
						if (err) console.error(err);
						console.log('Successfull deploy of the ticket '+ticket.id);
						console.log('Please create a pull request');
						console.log('Switching to dev');
						git.checkout('dev', {}, function (err) {
							if (err) return console.error(err);
							console.log('Everything is ready to start another ticket!');
							console.log('Dont forget to create a pull request!');
						});
					});
				});
			});
		});
	
	// Fix aws bug
		gulp.task('fix:aws', function () {
			shell.exec('rm -rf node_modules/aws-sdk/*.ts');
			shell.exec('rm -rf node_modules/aws-sdk/*.d.ts');
			shell.exec('rm -rf node_modules/aws-sdk/**/*.ts');
			shell.exec('rm -rf node_modules/aws-sdk/**/*.d.ts');
		})