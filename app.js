const express= require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

const app=express();

app.set("view engine","ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect('mongodb://localhost:27017/toDolistDB', {useNewUrlParser: true, useUnifiedTopology: true});

//schema
const itemsSchema={
    name: String
};

//module
const Item = mongoose.model("Item",itemsSchema);

const item1= new Item({
    name:"welcome to the toDo list"
});

const item2= new Item({
    name:"hit the + button to add a new item"
});

const item3 = new Item({
    name:"Thank you"
});
const defaultItems=[item1,item2,item3];


heading="TODAY";
// items=["watch lectures","drive","attend class"];
// workItems=[];

const listSchema={
    name:String,
    items:[itemsSchema]
};
const List= mongoose.model("List",listSchema);

app.get("/",function(req,res){
    Item.find({},function(err,found){
        if(found.length===0){
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("success!!");
                }
            });
        }
      
            res.render("list",{titleheading:heading, listItems:found});
        
    })

});
app.post("/",function(req,res){
    var itemName=req.body.newItem;
    var listName= req.body.list;

    const item= new Item({
        name:itemName
    });

    if(listName==="TODAY"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name:listName},function(err,found){
            found.items.push(item);
            found.save();
            res.redirect("/"+listName);
        })
    }

});

app.get("/:custom",function(req,res){
    const c=_.capitalize(req.params.custom);
    
    List.findOne({name:c},function(err,found){
        if(!found){
            //create a new list
            list=new List({
                name:c,
                items:defaultItems
            });
            list.save();
            res.redirect("/"+c);
        }else{
            //show an existing lost
            res.render("list",{titleheading:found.name, listItems:found.items})


        }
    })
    
});

app.post("/delete",function(req,res){
    const checkedId=req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "TODAY") {
              Item.findByIdAndRemove(checkedId, function(err){
                if (!err) {
                  console.log("Successfully deleted checked item.");
                  res.redirect("/");
                }
              });
            } else {
                      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedId}}}, function(err, found){
                        if (!err){
                          res.redirect("/" + listName);
                        }
                      });
                    }

   
    });
    




app.listen(3000,function(){
    console.log("server running on prt 3000!");
});
