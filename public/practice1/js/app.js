$(document).ready( function(){
    firebase.auth().onAuthStateChanged(user => {
        console.log(user);
        if (user) {
            $("#msgIn").prop("disabled", false);
            $("#nameIn").val(user.displayName);
            $("#login").toggleClass("d-none");
            $("#logout").toggleClass("d-none");
        }
    });
});

var provider = new firebase.auth.GoogleAuthProvider();

firebase.initializeApp(config);

var rootRef = firebase.database().ref();

$('#msgIn').keypress(function (e) {
    if (e.keyCode == 13) {
        var name = $('#nameIn').val();
        var text = $('#msgIn').val();
        rootRef.push({ name: name, text: text, like: 0 });
        $('#msgIn').val('');
    }
});

rootRef.on('child_added', function (ss) {
    var msgKey = ss.key;
    var msg = ss.val();
    dspChatMsg(msg.name, msg.text, msg.like, msgKey);
});

rootRef.on('child_removed', function (ss) {
    var msgKey = ss.key;
    $("#" + msgKey).remove();
});

rootRef.on('child_changed', function (ss) {
    var msgKey = ss.key;
    var msg = ss.val();
    $("#" + msgKey).find('.like').html("Like<i class='fas fa-heart mx-2'></i>" + msg.like);
    $("#" + msgKey).find('.like').data("like", msg.like);    
});

function dspChatMsg(name, text, like, key) {
    var chatMsgDom = generateMsgDom(name, text, like, key);
    $(chatMsgDom).appendTo($('#msgDiv'));
    $("html,body").animate({ scrollTop: $('#bottomDiv').offset().top }, 0);
    attachEvent();
};

function attachEvent(){
    $('.delete').off();
    $('.like').off();

    $(".delete").on("click", function(){
        firebase.database().ref($(this).attr("value")).remove().then(()=>{
            alert('削除しました！');
            $("#" + $(this).attr("value")).remove();
        })
        .catch( (error)=>{
            console.log(`削除時にエラーが発生しました (${error})`);
        });
    });

    $(".like").on("click", function(){
        console.log($(this).data("like"));
        var nextLike = $(this).data("like") + 1;
        firebase.database().ref($(this).attr("value")).update({
            like : nextLike
        }).then(()=>{
            $(this).html("Like<i class='fas fa-heart mx-2'></i>" + nextLike);
            $(this).data("like", nextLike);
        })
        .catch( (error)=>{
            console.log(`エラーが発生しました (${error})`);
        });
    });
}

$("#login").on("click", function(){
    firebase.auth().signInWithRedirect(provider);
});

$("#logout").on("click", function(){
    firebase.auth().signOut().then(()=>{
        alert("ログアウトしました");
        $("#msgIn").prop("disabled", true);
        $("#login").toggleClass("d-none");
        $("#logout").toggleClass("d-none");
    })
    .catch( (error)=>{
        console.log(`ログアウト時にエラーが発生しました (${error})`);
    });
});

function generateMsgDom(name, text, like, key){
    var dom = "<div class='col-md-4 px-2 my-3' id='" + key + "'>"+
                    "<div class='card'>"+
                        "<div class='card-header'>"+
                            name +
                        "</div>"+
                        "<div class='card-body'>"+
                            "<p class='card-text'>" + text + "</p>"+
                        "</div>"+
                        "<div class='card-footer'>"+
                            "<div class='row'>"+
                                "<div class='col-auto'>"+ 
                                    "<button class='btn btn-primary like' value='" + key + "' data-like='" + like + "'>"+
                                        "Like<i class='fas fa-heart mx-2'></i>" + like +
                                    "</button>"+
                                "</div>";

    if (name == $('#nameIn').val()) {
                    dom = dom + "<div class='col-auto'>"+
                                    "<button class='btn btn-primary delete' value='" + key + "'>"+
                                        "Delete<i class='fas fa-trash-alt mx-2'></i>"+
                                    "</button>"+
                                "</div>";
    } 
                dom = dom + "</div>"+
                    "</div>"+
                "</div>"+
            "</div>";

    return dom;
}