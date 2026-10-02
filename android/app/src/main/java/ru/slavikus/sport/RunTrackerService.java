package ru.slavikus.sport;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.content.pm.ServiceInfo;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.IBinder;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import org.json.JSONArray;

public class RunTrackerService extends Service implements LocationListener {
    public static final String ACTION_START = "ru.slavikus.sport.START_RUN";
    public static final String ACTION_STOP = "ru.slavikus.sport.STOP_RUN";
    private static final String CHANNEL = "run_tracker";
    private static final int NOTIFICATION_ID = 1102;
    private static final String PREFS = "run_tracker";
    private static volatile boolean running = false;
    private LocationManager locationManager;
    private Location lastLocation;

    @Nullable @Override public IBinder onBind(Intent intent) { return null; }

    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_STOP.equals(intent.getAction())) {
            finishTracking();
            return START_NOT_STICKY;
        }
        if (intent == null || !ACTION_START.equals(intent.getAction())) return START_NOT_STICKY;
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            stopSelf();
            return START_NOT_STICKY;
        }

        SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        if (!prefs.getBoolean("active", false)) {
            prefs.edit().putBoolean("active", true).putLong("startedAt", System.currentTimeMillis())
                .putFloat("meters", 0).putString("route", "[]").commit();
        }
        lastLocation = null;
        createChannel();
        Notification notification = notification(prefs.getFloat("meters", 0));
        if (Build.VERSION.SDK_INT >= 29) startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
        else startForeground(NOTIFICATION_ID, notification);
        running = true;

        locationManager = (LocationManager) getSystemService(LOCATION_SERVICE);
        try {
            locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 2000, 5, this);
        } catch (SecurityException error) {
            finishTracking();
        }
        return START_NOT_STICKY;
    }

    @Override public void onLocationChanged(Location location) {
        if (location.getAccuracy() > 35) return;
        SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        if (!prefs.getBoolean("active", false)) return;
        float meters = prefs.getFloat("meters", 0);
        if (lastLocation != null) {
            float segment = lastLocation.distanceTo(location);
            long elapsed = location.getTime() - lastLocation.getTime();
            if (elapsed <= 0) return;
            if (segment > 100 || segment / (elapsed / 1000f) > 12) {
                lastLocation = location;
                return;
            }
            meters += segment;
        }
        lastLocation = location;
        try {
            JSONArray route = new JSONArray(prefs.getString("route", "[]"));
            JSONArray point = new JSONArray();
            point.put(location.getLatitude());
            point.put(location.getLongitude());
            point.put(location.getTime());
            route.put(point);
            prefs.edit().putFloat("meters", meters).putString("route", route.toString()).apply();
        } catch (Exception ignored) {
            prefs.edit().putFloat("meters", meters).apply();
        }
        ((NotificationManager) getSystemService(NOTIFICATION_SERVICE)).notify(NOTIFICATION_ID, notification(meters));
    }

    @Override public void onProviderEnabled(String provider) {}
    @Override public void onProviderDisabled(String provider) {}

    @SuppressWarnings("deprecation")
    @Override public void onStatusChanged(String provider, int status, android.os.Bundle extras) {}

    private void finishTracking() {
        running = false;
        SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        prefs.edit().putBoolean("active", false).putLong("endedAt", System.currentTimeMillis()).commit();
        if (locationManager != null) locationManager.removeUpdates(this);
        stopForeground(STOP_FOREGROUND_REMOVE);
        stopSelf();
    }

    public static JSObject snapshot(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, MODE_PRIVATE);
        JSObject result = new JSObject();
        boolean active = prefs.getBoolean("active", false) && running;
        if (!active && prefs.getBoolean("active", false)) {
            prefs.edit().putBoolean("active", false).putLong("endedAt", System.currentTimeMillis()).commit();
        }
        long startedAt = prefs.getLong("startedAt", 0);
        long endedAt = active ? System.currentTimeMillis() : prefs.getLong("endedAt", startedAt);
        result.put("active", active);
        result.put("meters", prefs.getFloat("meters", 0));
        result.put("seconds", startedAt == 0 ? 0 : Math.max(0, (endedAt - startedAt) / 1000));
        try { result.put("route", new JSONArray(prefs.getString("route", "[]"))); }
        catch (Exception ignored) { result.put("route", new JSONArray()); }
        return result;
    }

    private void createChannel() {
        NotificationManager manager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        manager.createNotificationChannel(new NotificationChannel(CHANNEL, "GPS-трекер бега", NotificationManager.IMPORTANCE_LOW));
    }

    private Notification notification(float meters) {
        Intent launch = new Intent(this, MainActivity.class);
        PendingIntent pending = PendingIntent.getActivity(this, 0, launch, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        return new NotificationCompat.Builder(this, CHANNEL)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle("Запись пробежки")
            .setContentText(String.format(java.util.Locale.forLanguageTag("ru-RU"), "%.2f км · GPS работает", meters / 1000))
            .setContentIntent(pending)
            .setOngoing(true)
            .build();
    }

    @Override public void onDestroy() {
        running = false;
        if (locationManager != null) locationManager.removeUpdates(this);
        SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        if (prefs.getBoolean("active", false)) prefs.edit().putBoolean("active", false).putLong("endedAt", System.currentTimeMillis()).commit();
        super.onDestroy();
    }
}
