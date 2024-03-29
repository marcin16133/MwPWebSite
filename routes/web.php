<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/



Route::post('/measure', 'MeasureController@store');




Route::get('/measures', 'HomeController@plotData');

Route::post('/settings', 'HomeController@saveSettings');


Auth::routes();

Route::get('/', 'HomeController@index')->name('home');
