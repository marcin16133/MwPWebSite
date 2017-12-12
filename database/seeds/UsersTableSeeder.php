<?php

use Illuminate\Database\Seeder;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $user = new App\User();
        $user->email = 'aaa@aaa.pl';
        $user->password = bcrypt('qwerty');

        $user->save();
    }
}
