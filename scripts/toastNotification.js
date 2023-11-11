export const createToastNotification = (status) => {
    const toast = document.createElement('div')
    const msg = document.createElement('p')
    const img = document.createElement('img')

    toast.classList.add('toast', 'slideDown')

    msg.innerText = status === 'success' ? 'Download disponível!' : ('Desculpe, ocorreu um erro!')

    img.setAttribute('src', status === 'success' ? './imgs/success.svg' : './imgs/error.svg')

    toast.append(img, msg);
    document.body.append(toast)

    status === 'error' ? (setTimeout(() => {
        window.location.reload();
    }, 1000)) : (setTimeout(() => {
        document.body.removeChild(toast)
    }, 1000))
}