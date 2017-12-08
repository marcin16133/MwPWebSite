<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Measure extends Model
{
	protected $fillablee = ['temp','hum','humearth','water_level','date'];

    public $timestamps = false;
}
