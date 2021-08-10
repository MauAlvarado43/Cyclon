import 'dart:async';

import 'package:cyclon/utils/constants.dart';
import 'package:cyclon/utils/geolocation.dart';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'dart:math';

import 'package:socket_io_client/socket_io_client.dart' as IO;

import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class CyclonSocket {

  BuildContext context;
  FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin;
  NotificationDetails platformChannelSpecifics;

  Future initNotifications() async {
    flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();

    const AndroidInitializationSettings initializationSettingsAndroid = AndroidInitializationSettings('app_icon');
    final IOSInitializationSettings initializationSettingsIOS = IOSInitializationSettings();
    final MacOSInitializationSettings initializationSettingsMacOS = MacOSInitializationSettings();
    final InitializationSettings initializationSettings = InitializationSettings(
        android: initializationSettingsAndroid,
        iOS: initializationSettingsIOS,
        macOS: initializationSettingsMacOS);

    await flutterLocalNotificationsPlugin.initialize(initializationSettings);

    const AndroidNotificationDetails androidPlatformChannelSpecifics = AndroidNotificationDetails(
        'Cyclon', 'Cyclon', 'Cyclon',
        importance: Importance.max,
        priority: Priority.high,
        showWhen: false);

    platformChannelSpecifics = NotificationDetails(android: androidPlatformChannelSpecifics);
  }

  void showNotification(String name, String category, String distance) async {
    await flutterLocalNotificationsPlugin.show(0, '${AppLocalizations.of(context).alert} ${category} ${name} ${AppLocalizations.of(context).is_close} ${distance}${AppLocalizations.of(context).from_you}', AppLocalizations.of(context).details, platformChannelSpecifics);
  }

  String getCategory(double speed) {

    if (speed < 62)
      return AppLocalizations.of(context).dt;
    else if (speed < 118)
      return AppLocalizations.of(context).tt;

    return AppLocalizations.of(context).hh;

  }

  double getDistance(double lat1, double lng1, double lat2, double lng2) {

    lat1 = lat1 * pi / 180;
    lng1 = lng1 * pi / 180;
    lat2 = lat2 * pi / 180;
    lng2 = lng2 * pi / 180;

    double dlon = lng2 - lng1;
    double dlat = lat2 - lat1;

    double a = pow(sin(dlat / 2), 2) + cos(lat1) * cos(lat2) * pow(sin(dlon / 2), 2);
    double c = 2 * asin(sqrt(a));

    return c * 6371;

  }

  void socketInit(BuildContext _context) {

    context = _context;

    Timer.run(() async {
      await initNotifications();
    });

    IO.Socket socket = IO.io(IP, <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': true,
    });

    socket.on('connect', (_) {
      print('connect');
    });

    socket.on('/alert', (data) async {

      var position = await determinePosition();
      SharedPreferences prefs = await SharedPreferences.getInstance();

      if(prefs.getBool("notifications")) {
        double distance = getDistance(position.latitude, position.longitude, data["data"]["data"]["lastPoint"]["position"]["lat"], data["data"]["data"]["lastPoint"]["position"]["lng"]);

        if(distance <= 500) {
          String category = getCategory(data["data"]["data"]["lastPoint"]["windSpeed"]);
          showNotification(data["data"]["data"]["name"], category, distance.toStringAsFixed(2));
        }
      }

    });

    socket.on('disconnect', (_) => print('disconnect'));

    socket.connect();

  }

}