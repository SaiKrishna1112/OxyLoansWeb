import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import alertify from "alertifyjs";
import "../../../../node_modules/alertifyjs/build/css/alertify.css";
import "../../../../node_modules/alertifyjs/build/css/themes/semantic.css";

export const toastrSuccess = (message, position = "bottom-center") => {
  alertify.set("notifier", "position", position);
  alertify.success(message);
};
export const toastrInfo = () => {
  alertify.set("notifier", "position", "top-right");
  alertify.message("Have fun storming the castle!");
};
export const toastrWarning = (message) => {
  alertify.set("notifier", "position", "top-right");
  alertify.error(message);
};
export const topCenter1 = (messages) => {
  alertify.set("notifier", "position", "top-center");
  alertify.message(messages);
};
export const toastrError = (error) => {
  alertify.set("notifier", "position", "top-right");
  alertify.error(error);
};
export const topLeft = () => {
  alertify.set("notifier", "position", "top-left");
  alertify.message("Top Left! Have fun storming");
};
export const topCenter = () => {
  alertify.set("notifier", "position", "top-center");
  alertify.message("Top Center! Have fun storming");
};
export const topRight = () => {
  alertify.set("notifier", "position", "top-right");
  alertify.message("Top Right! Have fun storming");
};
export const topFull = () => {
  alertify.set("notifier", "position", "top-full");
  alertify.message("Top Full! Have fun storming");
};
export const bottomLeft = () => {
  alertify.set("notifier", "position", "bottom-left");
  alertify.message("Bottom Left! Have fun storming");
};
export const bottomCenter = (message) => {
  alertify.set("notifier", "position", "bottom-center");
  alertify.error(message);
};
export const bottomRight = () => {
  alertify.set("notifier", "position", "bottom-right");
  alertify.message("Bottom Right! Have fun storming");
};
export const bottomFull = () => {
  alertify.set("notifier", "position", "bottom-full");
  alertify.message("Bottom Full! Have fun storming");
};

export const notifications1 = () => {
  alertify.set("notifier", "position", "top-right");
  alertify.success("WhatsApp OTP verified successfully");

};
export const notificationssucces = () => {
  alertify.set("notifier", "position", "top-right");
  alertify.success("OTP sent to your WhatsApp number.");
};
export const notifications = () => {
  alertify.set("notifier", "position", "top-right");
  alertify.message("Notification! Have fun storming");
};
export const closeButton = () => {
  alertify.set("notifier", "position", "top-right");
  alertify.success("Close Button! Have fun storming");
};
export const progessBar = () => {
  var canDismiss = false;
  var notification = alertify.success("You can dismiss this after Progessbar!");
  notification.ondismiss = function () {
    return canDismiss;
  };
  setTimeout(function () {
    canDismiss = true;
  }, 3000);
};
export const clearToast = () => {
  alertify.message("Cleared").dismissOthers();
};
const show5 = () => {
  var duration = 5;
  alertify.set("notifier", "position", "top-right");
  var msg = alertify.message(
    "Auto-dismiss in " + duration + " seconds.",
    5,
    function () {
      clearInterval(interval);
    }
  );
  var interval = setInterval(function () {
    msg.setContent("Auto-dismiss in " + --duration + " seconds.");
  }, 1000);
};
export const hide3 = () => {
  var duration = 3;
  alertify.set("notifier", "position", "top-right");
  var msg = alertify.message(
    "Auto-dismiss in " + duration + " seconds.",
    3,
    function () {
      clearInterval(interval);
    }
  );
  var interval = setInterval(function () {
    msg.setContent("Auto-dismiss in " + --duration + " seconds.");
  }, 1000);
};
export const timeout5 = () => {
  var duration = 5;
  alertify.set("notifier", "position", "top-right");
  var msg = alertify.message(
    "Auto-dismiss in " + duration + " seconds.",
    5,
    function () {
      clearInterval(interval);
    }
  );
  var interval = setInterval(function () {
    msg.setContent("Auto-dismiss in " + --duration + " seconds.");
  }, 1000);
};
export const sticky = () => {
  var canDismiss = false;
  var notification = alertify.success("Sticky Toaster have Fun");
  notification.ondismiss = function () {
    return canDismiss;
  };
  setTimeout(function () {
    canDismiss = true;
  }, 100000);
};
