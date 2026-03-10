<?php
function getRangoPHP($hour)
{
    // $hour format is HH:mm:ss
    $parts = explode(':', $hour);
    $h = (int) $parts[0];

    $time = "AM";
    $h_int = $h;

    if ($h_int >= 12) {
        $time = "PM";
    }

    // Convert to 12-hour format for the display text
    $h_12 = $h_int % 12;
    if ($h_12 == 0) {
        $h_12 = 12;
    }

    $next_h_int = $h + 1;
    $next_h_12 = $next_h_int % 12;
    if ($next_h_12 == 0) {
        $next_h_12 = 12;
    }

    $next_time = ($next_h_int >= 12) ? "PM" : "AM";
    if ($next_h_int >= 24) {
        $next_time = "AM"; // Handle wrap around midnight if necessary, though unlikely for appointments
    }

    // Simplification based on your original JS logic (which was slightly flawed for 12/1PM boundary):
    // Let's use the 24-hour hour for simpler comparison logic:

    // Determine the hour part for the range display
    $h_display = $h;
    if ($h_display >= 13) {
        $h_display -= 12;
    } elseif ($h_display === 0) {
        $h_display = 12; // Midnight
    }

    $next_h_display = $h + 1;
    if ($next_h_display >= 13) {
        $next_h_display -= 12;
    } elseif ($next_h_display === 0) {
        $next_h_display = 12; // Midnight
    }

    // Determine the AM/PM suffix for the *start* time
    $suffix = ($h >= 12) ? "PM" : "AM";

    // Simplified Rango calculation:
    // This assumes your client wants "8 a 9 AM", "12 a 1 PM", "1 a 2 PM", etc.
    // The safest way is to format the exact hour/next hour string.

    $start_display = ($h > 12) ? ($h - 12) : (($h == 0) ? 12 : $h);
    $end_display = (($h + 1) > 12) ? (($h + 1) - 12) : ((($h + 1) == 0) ? 12 : ($h + 1));

    $suffix = ($h >= 12 && $h < 24) ? "PM" : "AM";

    return $start_display . " a " . $end_display . " " . $suffix;
}
?>