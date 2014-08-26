ub = {
    // return a string of random a-z, A-Z, and 0-9 characters
	random_string : function(num) {
		var string = "";
    	var characters = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","0","1","2","3","4","5","6","7","8","9"];
        for(var i=0;i<num;i++) {
        	var element = Math.floor(Math.random() * 61);
        	string += characters[element];
        };
        return string;
    }
};