    /**
     * listen to outer drag events,and take it no effect
     * lwang1222@gmail.com
     **/
    $(window).on('dragover', function (e) {
        e.preventDefault();
        e.originalEvent.dataTransfer.dropEffect = 'none';
    });
    $(window).on('drop', function (e) {
        e.preventDefault();
    });
