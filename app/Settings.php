<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Settings extends Model
{
    protected $fillable = ['time_between_water', 'amount_water_to_water', 'treshold'];
}
