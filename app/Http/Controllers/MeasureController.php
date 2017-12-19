<?php

namespace App\Http\Controllers;

use App\Measure;
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
        }
        catch (Exception $e){
            return response()->json(array("status" => false, "response" => "no all fields"),404);
        }
        return response()->json(array("status" => true, "response" => "OK", 202));
    }
}
