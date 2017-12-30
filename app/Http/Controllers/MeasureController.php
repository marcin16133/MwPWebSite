<?php

namespace App\Http\Controllers;

use App\Measure;
use App\Settings;
use Illuminate\Http\Request;
use Exception;

class MeasureController extends Controller
{


    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        
        try {
            $measure = new Measure();
            $measure->temp = $request->input('temp');
            $measure->hum = $request->input('hum');
            $measure->humearth = $request->input('humearth');
            $measure->water_level = $request->input('water_level');
            $measure->date = $request->input('date');
            $measure->save();

            
            $settings = Settings::first();

            return response()->json(array("status" => true, 
                'time_between_water' => $settings->time_between_water, 
                    'amount_water_to_water' => $settings->amount_water_to_water, 
                        'treshold' => $settings->treshold) ,202);
        }
        catch (Exception $e){
            return response()->json(array("status" => false),404);
        }
    }
}
