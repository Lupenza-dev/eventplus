<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property string|null $name
 * @property bool $is_active
 * @property string $uuid
 */
#[Fillable(['name', 'is_active'])]
class ThreadType extends Model
{
    // use SoftDeletes;
}
