const checkPermission = () => {
    if (('Notification' in window)) {
        console.log("support for notification API");
    }
    else{
        console.log("NO support for notification API");
    }

    if (('PushManager' in window)) {
        console.log("support for Push API")
    }
}
function registerServiceWorker() {

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('Service Worker зарегистрирован:', registration);
          })
          .catch(error => {
            console.log('Ошибка регистрации Service Worker:', error);
          });
      });
    }
  }
   

const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
        throw new Error("Notification permission not granted")
    }

}

const main = async () => {
    registerServiceWorker();
    checkPermission()
    await requestNotificationPermission()
    
}

main()