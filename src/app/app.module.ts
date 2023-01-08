import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSliderModule } from '@angular/material/slider';

import { AppComponent } from './app.component';
import { CodeLineDirective } from './code-line.directive';
import { DebuggerDotComponent } from './debugger-dot/debugger-dot.component';

@NgModule({
  declarations: [AppComponent, CodeLineDirective, DebuggerDotComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatTooltipModule,
    MatSliderModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
