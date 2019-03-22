import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

declare var particlesJS: any;
declare var jQuery: any;
declare var require: any;

declare global {
  interface Window { jQuery: any; $: any; }
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  

  constructor() { }

  ngOnInit() {
    
    if (environment.desktop) {
      window.jQuery = window.$ = require('node_modules/jquery/dist/jquery.js');
      particlesJS.load('particles-js', 'assets/data/particles.json', function() { console.log('callback - particles.js config loaded'); });
    } else {
      particlesJS.load('particles-js', '../../assets/data/particles.json', function() { console.log('callback - particles.js config loaded'); });
    }
    (function ($) {
      var myTarget;
      $('.menu-close').on('click', function (e) {
        e.preventDefault();
        $('.menu-sub-holder').removeClass('active');
      });
      $('.sub-left').on('click', function (e) {
        e.preventDefault();
        $('.menu-sub-holder').removeClass('active');
      });
      $('.menu-item').on('click', function (e) {
        e.preventDefault();
        myTarget = $(this).attr('data-link');
        $('.'+myTarget).addClass('active');
        if(myTarget == 'menu-sub-search') $('.search-text').focus();
      });
      $('.menu-search-field').on('click', function (e) {
        e.preventDefault();
        myTarget = $(this).attr('data-link');
        $('.'+myTarget).addClass('active');
        $('.search-text').focus();
      });
    
    
    
    
      $(window).click(function() {
        //Hide the menus if visible
        $('.menu-sub-holder').removeClass('active');
      });
      
      $('.qlc-menu').click(function(event){
        event.stopPropagation();
      });
    
    
    
    
    
    
      $('.navbar-toggler').on('click', function (e) {
        e.preventDefault();
        $('.navbar').toggleClass('open');
      });
      
      $('.table-button-expand').on('click', function (e) {
        e.preventDefault();
        $(this).toggleClass('closed');
        $(this).closest('div').next().toggleClass('open');
      });
      
      $('.table-button-tokens').on('click', function (e) {
        e.preventDefault();
        $('.qlc-table-extra-token').toggleClass('closed');
        $('.link-token-toggle').toggleClass('closed');
      });
      
      /* LANG SELECT */
      $('.qlc-top-language').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).toggleClass('open');
        $('.qlc-top-language-selector').toggleClass('open');
      });	
      
      $(window).click(function() {
        var langMenuState = $('.qlc-top-language-selector').hasClass('open');
        if (langMenuState === true) {
          $('.qlc-top-language').toggleClass('open');
          $('.qlc-top-language-selector').toggleClass('open');
        }
      });
    
      $('.qlc-top-language-selector').click(function(e){
        e.stopPropagation();
      });
      $('.qlc-top-language-but').click(function(e){
        e.preventDefault();
        e.stopPropagation();
        $('.qlc-top-language').toggleClass('open');
        $('.qlc-top-language-selector').toggleClass('open');
      });
      
      /* TOOLTIP INIT */
      /*$(function () {
          $('[data-toggle="tooltip"]').tooltip();
      });*/
    })(jQuery);
  }

}
