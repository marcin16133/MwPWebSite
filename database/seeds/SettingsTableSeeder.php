<?php

use Illuminate\Database\Seeder;

class SettingsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $settings = new App\Settings();
        $settings->time_between_water = 600000;
        $settings->amount_water_to_water = 10;
        $settings->treshold = 50;
        $settings->save();
    }
}
