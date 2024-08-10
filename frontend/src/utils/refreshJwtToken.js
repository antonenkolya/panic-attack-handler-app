export const refreshJwtToken = () => {
    return fetch('/token', {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Не удалось обновить токен');
    })
    .then(data => {
        console.log('Токен обновлен');
       
    })
    .catch(error => {
        console.error('Ошибка при обновлении токена:', error);
        // Обработка ошибки, например, выход из системы
    });
}
