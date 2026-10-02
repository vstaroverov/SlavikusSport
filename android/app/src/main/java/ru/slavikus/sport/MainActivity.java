package ru.slavikus.sport;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(RunTrackerPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
