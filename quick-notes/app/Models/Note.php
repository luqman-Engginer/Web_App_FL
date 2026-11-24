<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    /**
     * Mass assignable attributes.
     */
    protected $fillable = [
        'title',
        'content',
        'color',
    ];
}

