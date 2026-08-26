<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $vendor_id
 * @property int $user_id
 * @property string $vendor_type
 * @property Carbon|null $deleted_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['vendor_id', 'user_id', 'vendor_type'])]
class VendorUser extends Model
{
    use SoftDeletes;

    /** @var array<string, string> */
    protected $attributes = [
        'vendor_type' => 'vendor',
    ];
}
