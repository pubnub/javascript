(function(){

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// SETTINGS
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
var settings = {
    publish_key   : 'demo'//'pub-5ad63a7a-0c72-4b86-978d-960dcdb971e1'
,   subscribe_key : 'demo'//'sub-459a5e4a-9de6-11e0-982f-efe715a9b6b8'
//,   secret_key    : 'sec-fa847381-dcdb-4bcf-a8aa-7b812c390441'
//,   cipher_key    : 'ODgwNDsmIzczMDustKOiJiM4NzM0O7aqSDNh2mig'
,   ssl           : true
};


// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// INIT OBJECTS AND ELEMENTS
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
var db_admin                = PUBNUB.sync( 'db-admin',  settings, '', function() {
    db_admin.all(admin_update);
})
,   db_public               = PUBNUB.sync( 'db-public', settings, '', function() {
    db_public.all(public_update);
})
,   push_submit             = PUBNUB.$('push-submit')
,   new_headline_area       = PUBNUB.$('new-headline-area')
,   embed_code              = PUBNUB.$('embed-code')
,   embed_code_button       = PUBNUB.$('embed-code-button')
,   live_posts              = PUBNUB.$('live-posts')
,   push_text_area          = PUBNUB.$('push-text-area')
,   push_edit_panel         = PUBNUB.$('push-edit-panel')
,   published_template      = PUBNUB.$('published-template').innerHTML
,   curator_editor_template = PUBNUB.$('curator-editor-template').innerHTML
,   publish_edit_template   = PUBNUB.$('publish-edit-template').innerHTML;


// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// VIEW EMBED CODE
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
PUBNUB.bind( 'mousedown,touchstart', embed_code_button, function() {
    animate( embed_code, [
        { 'd' : 0.1, 'opacity' : 0.0, 'ty' : -10, 'display' : 'block' },
        { 'd' : 0.5, 'opacity' : 1.0, 'ty' : 0,   'display' : 'block' }
    ] );
    location.href = "#embed-code";
} );


// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// PUSH SUBMIT ACTION
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
PUBNUB.bind( 'mousedown,touchstart', push_submit, submit_headline );
PUBNUB.bind( 'keyup', push_text_area, function(e) {
   if ((e.keyCode || e.charCode) === 13) submit_headline();
} );

function submit_headline() {
    var headline = safe(push_text_area.value||'');
    if (!headline) return;
    push_text_area.value = '';

    // Create NEW Headline Entry
    db_admin.create({ headline : headline, time : +new Date });
}


// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// CURATOR RECEIVE HEADLINE FOR PUBLISHING AND EDITING
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
db_admin.on.change(admin_update);
//db_admin.all(admin_update);

function admin_update(item) {
    delete_private(item);
    (function(){
        var div = PUBNUB.create('div');
        animate( div, [
            { 'd' : 0.1, 'opacity' : 0.0, 'ty' : -10 },
            { 'd' : 0.5, 'opacity' : 1.0, 'ty' : 0 }
        ] );
        new_headline_area.insertBefore( div, first_div(new_headline_area) );
        return div;
    })().innerHTML = PUBNUB.supplant( publish_edit_template, {
        id       : item.id
    ,   headline : safe(item.data.headline)
    } );
}


// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// RECEIVING LIVE POSTS: STREAM FEEDER!
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
db_public.on.change(public_update);
//db_public.all(public_update);

function public_update(item) {
    delete_public(item);
    (function(){
        var div = PUBNUB.create('div');
        animate( div, [
            { 'd' : 0.1, 'opacity' : 0.0, 'ty' : -10 },
            { 'd' : 0.5, 'opacity' : 1.0, 'ty' : 0 }
        ] );
        live_posts.insertBefore( div, first_div(live_posts) );
        return div;
    })().innerHTML = PUBNUB.supplant( published_template, {
        id       : item.id
    ,   headline : safe(item.data.headline)
    } );
}


// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// RECEIVING DELETE
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
db_public.on.delete(delete_public);
db_admin.on.delete(function(item){
    delete_public(item);
    delete_private(item);
});

function delete_public(data) {
    var previous = PUBNUB.$('published-'+data.id);
    if (previous) live_posts.removeChild(previous.parentNode);
}

function delete_private(data) {
    var previous = PUBNUB.$(data.id);
    if (previous)
        new_headline_area.removeChild(previous.parentNode.parentNode);
}


// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// EDITOR
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
delegate( PUBNUB.$('new-headline-area'), 'editor' );
delegate( PUBNUB.$('push-edit-panel'),   'editor' );

// PUBLISH
PUBNUB.events.bind( 'editor.publish', function(event) {
    db_public.create(
        { headline : PUBNUB.$(event.data).innerHTML, time : +new Date },
        event.data
    );
} );

// HIDE
PUBNUB.events.bind( 'editor.hide', function(event) {
    db_public.delete(event.data);
} );

// FOREVER DELETE
PUBNUB.events.bind( 'editor.delete', function(event) {
    db_admin.delete(event.data);
    db_public.delete(event.data);
} );

// EDITOR SHOW
PUBNUB.events.bind( 'editor.edit', function(event) {
    push_edit_panel.innerHTML = PUBNUB.supplant(
        curator_editor_template,
        { id : event.data }
    );
    PUBNUB.css( push_edit_panel, { display : 'block' } );
    var push_text_edit   = PUBNUB.$('push-text-edit-area');
    push_text_edit.value = PUBNUB.$(event.data).innerHTML;
    push_text_edit.focus();
} );

// EDITOR SAVE
PUBNUB.events.bind( 'editor.save', function(event) {
    PUBNUB.css( push_edit_panel, { display : 'none' } );

    db_admin.update(
        event.data,
        { headline : safe(PUBNUB.$('push-text-edit-area').value) }
    );
} );

// EDITOR CANCEL
PUBNUB.events.bind( 'editor.cancel', function(event) {
    PUBNUB.css( push_edit_panel, { display : 'none' } );
} );


// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// GET ELEMENT ACTION DATA ATTRIBUTE AND FIRE ASSOCIATED EVENT
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
function delegate( element, namespace ) {
    PUBNUB.bind( 'mousedown,touchstart', element, function(e) {
        var data   = bubblefind( e, 'data-data' )
        ,   action = bubblefind( e, 'data-action' );
        if (!action) return true;
        PUBNUB.events.fire( namespace + '.' + action.result, {
            action : action.result,
            target : action.target,
            data   : data.result
        } );
    } );
}

function bubblefind( e, attr ) {
    var target = e.target || e.srcElement || {}
    ,   result = '';
    while (target) {
        result = PUBNUB.attr( target, attr );
        if (result) return { result : result, target : target };
        target = target.parentNode;
    }
}

function first_div(elm) { return elm.getElementsByTagName('div')[0] }
function safe(text)     { return (text||'').replace( /[<>]/g, '' )  }

})();
