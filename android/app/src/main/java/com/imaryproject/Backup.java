package com.imaryproject;

import android.app.Activity;

import androidx.annotation.NonNull;


public interface Backup {
    void init(@NonNull final Activity activity);

    void start();

    void stop();

}