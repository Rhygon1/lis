document.querySelector('.submit').addEventListener('click', () => {
    let code = document.querySelector('.code').value
    if (code) {
        let urlencoded = new URLSearchParams();
        urlencoded.append("Code", code.toUpperCase());

        var requestOptions = {
            method: 'DELETE',
            body: urlencoded,
        };

        fetch("/delete", requestOptions)
        document.querySelector('.code').value = ''
    }
})