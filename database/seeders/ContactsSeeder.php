<?php

namespace Database\Seeders;

use App\Models\Contact;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Mail\Mailables\Content;

class ContactsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        for ($i = 0; $i < 100000; $i++) {
            Contact::create(
                ['name' => fake()->name(), 'address' => fake()->address(), 'email' => fake()->unique()->safeEmail(), 'message' => fake()->text()]
            );
        }
    }
}
