import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CodeLineDirective } from './code-line.directive';

@NgModule({
  declarations: [AppComponent, CodeLineDirective],
  imports: [BrowserModule, BrowserAnimationsModule, AppRoutingModule, MatTooltipModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
