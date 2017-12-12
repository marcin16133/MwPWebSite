<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Measure;
use Khill\Lavacharts\Lavacharts;


class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $measures = Measure::paginate(5);

        $temperatures = $this->setData();

        \Lava::LineChart('Temps', $temperatures, [
            'title' => 'Weather in October'
        ]);

        return view('home.index', compact('measures'));
    }


    public function plotData(){
        $temperatures = $this->setData();
        return response()->json($temperatures);
    }


    private function setData(){
        $count = 10; // ile ostatnich
        $measuresToPlot = Measure::orderBy('date', true)->limit($count)->get()->toArray();

        $temperatures = \Lava::DataTable();

        $temperatures->addDateColumn('Data')
                     ->addNumberColumn('Temperatura');

        foreach ($measuresToPlot as $measure) {
            $temperatures->addRow([$measure['date'],  $measure['temp']]);
        }
        return $temperatures;
    }
}
