import { NgModule, Component } from '@angular/core'
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { UIRouterModule } from 'ui-router-ng2';
import { components, componentsList } from './components';
import { AppComponent } from './app';
import { states } from './app.routes';


@NgModule({
  declarations: [ AppComponent ].concat(componentsList),
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    UIRouterModule.forRoot({ states: states, useHash: true })
  ],
  providers: [],
  bootstrap: [ AppComponent ]
})
export class AppModule {}