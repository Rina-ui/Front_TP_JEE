// src/app/shared/shared-module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Logo } from './components/logo/logo';
import { Sidebar } from './components/sidebar/sidebar';

import { StatCard } from './components/stat-card/stat-card';
import {Navbar} from './components/navbar/navbar';

@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    CommonModule,
    RouterModule,
    Logo,
    Sidebar,
    Navbar,
    StatCard
  ]
})
export class SharedModule { }
