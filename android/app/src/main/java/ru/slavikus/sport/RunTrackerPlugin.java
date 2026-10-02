package ru.slavikus.sport;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.location.LocationManager;
import android.os.Build;
import androidx.core.content.ContextCompat;
import com.getcapacitor.Plugin;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.PermissionState;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(name = "RunTracker", permissions = {
    @Permission(alias = "location", strings = { Manifest.permission.ACCESS_FINE_LOCATION }),
    @Permission(alias = "notifications", strings = { Manifest.permission.POST_NOTIFICATIONS })
})
public class RunTrackerPlugin extends Plugin {
    @PluginMethod
    public void start(PluginCall call) {
        if (getPermissionState("location") != PermissionState.GRANTED) {
            requestPermissionForAlias("location", call, "locationPermissionCallback");
            return;
        }
        requestNotificationAndStart(call);
    }

    @PermissionCallback
    private void locationPermissionCallback(PluginCall call) {
        if (getPermissionState("location") == PermissionState.GRANTED) requestNotificationAndStart(call);
        else call.reject("Разреши точное местоположение для записи маршрута.");
    }

    private void requestNotificationAndStart(PluginCall call) {
        if (Build.VERSION.SDK_INT >= 33 && getPermissionState("notifications") != PermissionState.GRANTED) {
            requestPermissionForAlias("notifications", call, "notificationPermissionCallback");
        } else startService(call);
    }

    @PermissionCallback
    private void notificationPermissionCallback(PluginCall call) {
        startService(call);
    }

    private void startService(PluginCall call) {
        LocationManager manager = (LocationManager) getContext().getSystemService(Context.LOCATION_SERVICE);
        if (manager == null || !manager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
            call.reject("Включи GPS в настройках Android.");
            return;
        }
        try {
            Intent intent = new Intent(getContext(), RunTrackerService.class);
            intent.setAction(RunTrackerService.ACTION_START);
            ContextCompat.startForegroundService(getContext(), intent);
            JSObject starting = new JSObject();
            starting.put("active", true);
            starting.put("meters", 0);
            starting.put("seconds", 0);
            call.resolve(starting);
        } catch (Exception error) {
            call.reject("Не удалось запустить GPS-трекер: " + error.getMessage());
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        getContext().getSharedPreferences("run_tracker", Context.MODE_PRIVATE).edit()
            .putBoolean("active", false).putLong("endedAt", System.currentTimeMillis()).commit();
        Intent intent = new Intent(getContext(), RunTrackerService.class);
        intent.setAction(RunTrackerService.ACTION_STOP);
        getContext().startService(intent);
        call.resolve(RunTrackerService.snapshot(getContext()));
    }

    @PluginMethod
    public void status(PluginCall call) {
        call.resolve(RunTrackerService.snapshot(getContext()));
    }
}
