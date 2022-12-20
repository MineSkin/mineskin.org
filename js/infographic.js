$(document).ready(function(){
    $('#infographic-picture').prepend(`
    <source media="(prefers-color-scheme: light)"
                    sizes="
                (max-width: 2000px) 1920px,
                (max-width: 1300px) 1280px,
                (max-width: 700px) 640px,
                (max-width: 300px) 256px,
                2560px"
                    src="/img/infographic-128w.jpg"
            srcset="
                /img/infographic-128w.jpg 128w,
                /img/infographic-256w.jpg 256w,
                /img/infographic-640w.jpg 640w,
                /img/infographic-1280w.jpg 1280w,
                /img/infographic-1920w.jpg 1920w,
                /img/infographic-2560w.jpg 2560w">
            <source media="(prefers-color-scheme: dark)"
                    sizes="
                (max-width: 2000px) 1920px,
                (max-width: 1300px) 1280px,
                (max-width: 700px) 640px,
                (max-width: 300px) 256px,
                2560px"
                    src="/img/infographic-dark-128w.jpg"
                    srcset="
                /img/infographic-dark-128w.jpg 128w,
                /img/infographic-dark-256w.jpg 256w,
                /img/infographic-dark-640w.jpg 640w,
                /img/infographic-dark-1280w.jpg 1280w,
                /img/infographic-dark-1920w.jpg 1920w,
                /img/infographic-dark-2560w.jpg 2560w">
    `)
})
