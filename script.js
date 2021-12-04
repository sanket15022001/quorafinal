// $("add_category_button").on('click',function(event)
// {
//     event.preventDefault();
//     event.stopPropagation();
//     $.ajax({
//         url: "/comment/"+$("#add_category_form").data("postId"),
//         type:"POST",
//         contentType:'application/json',
//         data:JSON.stringify({comment:{"text":${input_category_name}.val()}})
//     }).done(function(result)
//     {
//         changeComments(result);
//         removeTextFromInput("input_category_name");
//     })
//     .fail(funtion(err){
//      console.log(err);
//     })  
// });

// var changeComments = function(comments){
//     var div = document.getElementById("input_category_section");
//     div.innerHTML = comments;
// }
// var removeTextFromInput = function(input){
//     var removeThis = document.getElementById(input);
//     removeThis.value="";
// }

// <%    function ShowAndHide() { %>

//     <%  var x = document.getElementById("j"); %>
//      <%  if (x.style.display == 'none') {  %>
//       <%   console.log(x.style.display);   %>
//       <%     x.style.display = 'block';    %>
//       <%  } else {      %>
//         <%   console.log("Hello");   %>
//         <%    x.style.display = 'none';   %>
//         <%  }  %>
    
//         <% }  %>



//working commments
// function reply_click(clicked_id)
            // {
              // $(this).attr("id",clicked_id);
             
                // alert( $(this).attr("id"));
              
            
             
          
              // $(document).ready(function click(clicked_id){
                // $(this).attr("id",clicked_id);
                // alert( $(this).attr("id"));
                // var id =$(this).attr("id");
                
            //   function hideAll() {
            //   console.log("Hii");
            //   if($("section").hasClass('show'))
            //   {
            //     $("section").addClass('hide');
            //    $("section").removeClass('show');
            //    console.log("if");
            //   }
            //   else if($("section").hasClass('hide')){
            //     $("section").addClass('show');
            //   $("section").removeClass('hide');
            //   // $(this).siblings('section:first').addClass('show');
            //   console.log("Else");
            //   }
          
            // }
            function abcd(clicked_id){
                $(this).attr("id","button"+clicked_id);
                $('section').attr("id","section"+clicked_id);
                  var cid=$(this).attr("id");
                  var id =$('section').attr("id");
                  console.log("#"+id)
    
                  
                  $("#"+id).toggle()
                //   $("#"+cid).on('click',function abc(e) {
                   
                 
                // })
              
            }
              // }); 
              // }
           
              // function createLikesSection(data) {

              //   var isLiked = false;
    
              //   for (var b = 0; b < data.likers.length; b++){ 
              //     var liker = data. likers[b];
              //     if (liker._id== window.user, id) { 
              //     isLiked = true;
    
    
              //      break;
              //     }
              //   }
    // var html = "";
    
    // html+= '<div class="we-video-info">';
    
    // html+='<ul>';
    
    // html+='<li>';
    
    // var className = "";
    // if (isLiked) {
    
    //   className ="like";
      
    // } else {
    //   className ="none";
    // }
    
    
    
    //            var html='';
    //             html += createLikeSection(data);
    //             html += '<span class="'+className+'" onclick="toggleLikePost(this);" data-id=""

    // function abcd(clicked_id){
                
    //   console.log("clicked_id");
    //   // $('section').attr("id","section"+clicked_id);
    //     // var cid=$(this).attr("id");
    //     // var id =$('section').attr("id");
    //     // console.log("#"+id)

        
    //     // $("#"+id).toggle()
    //   //   $("#"+cid).on('click',function abc(e) {
         
       
    //   // })
    //   }

    <form action="/login" method="POST">
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" class="form-control" name="username">
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" class="form-control" name="password">
            </div>
            <button type="submit" class="btn btn-dark">Login</button>
          </form>

          <div class="col-sm-4">
      <div class="card">
        <div class="card-body">
          <a class="btn btn-block btn-social btn-google" href="/auth/google" role="button">
            <i class="fab fa-google"></i>
            Sign In with Google
          </a>
        </div>
      </div>
    </div>
    <% comments.forEach(function(comment){  %>
                       
                       <% if(comment.postID == post._id) %>
                        <% count++ })%>

//

<% if(flag === true){ %>
    
    <form action="/changeName" method="POST">
        <input type="text" placeholder="Enter the name you want to change" name="cname">
        <a href="/changeName"><button>Change name</button></a>
    </form>

<% } else { %>

     <p> You cannot change your name using google login </p>
<% }%>