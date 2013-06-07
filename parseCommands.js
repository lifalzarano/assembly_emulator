// JavaScript Document

function executeCode() {
	for (var i = 0; i < code.length; i++) {
		// Check to see if line is commented out. If so, continue.
		if (code[i][0].charAt(0) == ';') {
			continue;
		}
		
		// Check to see if line has been flagged as one that should be skipped
		if (i == skip1 || i == skip2) {
			continue;
		}
		
		var len = code[i][0].length;
		
		// Check to see if this is a line label 
		if ( code[i][0].charAt(len-1) == ':') {
			continue;
		}
		
		// Check to see if this is an empty line
		if ( code[i][0] == '') {
			continue;
		}
		
		// Variable that will hold conditional case, i.e. 'GT' or 'EQ'..
		var comp ="";
		// Copy last two letters of command to comp
		comp += code[i][0].charAt(len-2)+code[i][0].charAt(len-1);
		
		// Variable that will hold command, i.e. 'ADD' or 'LDR'..
		var command = "";
		
		// Check to see if a conditional case has been stated
		if (comp == "NE" || comp == "CS" || comp == "CC" || comp == "MI" || comp == "PL" || comp == "HI" || comp == "LS" || comp == "GT" || comp == "GE" || comp == "EQ" || comp == "LE" || comp == "LT") {
			// If so, copy all but last two characters to command
			for (var j = 0; j < len-2; j++) {
				command += code[i][0].charAt(j);
			}
			
			// Check to see if comp is true or false
			var result = compCmd(comp);
			
			// If condition is false, continue with next iteration
			if (!result) {
				continue;
			}
			
		} else {
			command = code[i][0];
		}
		
		if (command == "LDR") {
			if (!code[i][2] ) {
				console+="Line "+(i+1)+": Incomplete LDR statement <br />";
				return 0;
			}
			
			// Get register where value will be stored
			var store = code[i][1].charAt(1);
			
			var x = new Array(32);
			x = loadVal(code[i][2]);
			
			if (!x) { return 0; }
			
			// Use MOV function to place value in x in specified register
			MOV(R[store], x);
			continue;	
			
		}
		if (command == "LDRB") {
			if (!code[i][2] ) {
				console+="Line "+(i+1)+": Incomplete LDRB statement <br />";
				return 0;
			}
			
			// Get register where value will be stored
			var store = code[i][1].charAt(1);
			
			var x = new Array(32);
			x = loadVal(code[i][2]);
			
			if (!x) { return 0; }	
			
			LDRB(R[store], x);
			continue;	
		}
		if (command == "LDRSB") {
			if (!code[i][2] ) {
				console+="Line "+(i+1)+": Incomplete LDRSB statement <br />";
				return 0;
			}
			
			// Get register where value will be stored
			var store = code[i][1].charAt(1);
			
			var x = new Array(32);
			x = loadVal(code[i][2]);
			
			if (!x) { return 0; }
			
			LDRSB(R[store], x);
			continue;	
		}
		if (command == "LDRD") {
			var negative = false;
			if (!code[i][1] ) {
				console+="Line "+(i+1)+": Incomplete LDRD statement <br />";
				return 0;
			}
			
			// Get register to be stored in
			var s1 = code[i][1].charAt(1);
			var s2 = code[i][2].charAt(1);
			
			var temp = new Array(64);
			
			var num = "";
			var j;
			if (code[i][3].charAt(1) == '-') {
				j = 2;
				negative = true;
			} else {
				j = 1;
			}
			while (code[i][3].charAt(j)) {
				num += code[i][3].charAt(j);
				j++;
			}
			getBinary(num, temp);
			if (negative) {
				twoComp(temp);
			}
			
			
			LDRD(R[s1], R[s2], temp);
			continue;	
		}
		if (command == "LDRH") {
			if (!code[i][1] ) {
				console+="Line "+(i+1)+": Incomplete LDRH statement <br />";
				return 0;
			}
			
			// Get register to be stored in
			var store = code[i][1].charAt(1);
			
			var x = new Array(32);
			x = loadVal(code[i][2]);
			
			if (!x) { return 0; }
			
			LDRH(R[store], x);
			continue;	
		}
		if (command == "LDRSH") {
			if (!code[i][1] ) {
				console+="Line "+(i+1)+": Incomplete LDRSH statement <br />";
				return 0;
			}
			
			// Get register to be stored in
			var store = code[i][1].charAt(1);
			
			var x = new Array(32);
			x = loadVal(code[i][2]);
			
			if (!x) { return 0; }
			
			LDRSH(R[store], x);
			continue;	
		}
		if (command == "B") {
			var location = code[i][1];
			location += ""+":";
			
			// Check for complete statement
			if (!location) {
				console+="Line "+(i+1)+": B to where?? <br />";
				return 0;
			}
			
			// Increment through array of code, search for location
			for (var j = 0; j < code.length; j++) {
				if (code[j][0] == location) {
					i = j;
					break;
				}
			}
			
			continue;
		}
		if (command == "BX") {
			// Check for LR
			if (code[i][1] != "LR") {
				console+="Line "+(i+1)+": You can only BX LR! <br />";
				return 0;
			}
			
			// Set next iteration to be equal to LR
			
			continue;
		}
		if (command == "ADC" || command == "ADCS" ) {
			// Check for complete statement
			if (!code[i][2] || !code[i][3] ) {
				console+="Line "+(i+1)+": Incomplete ADD statement <br />";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][4]) {
				console+="Line "+(i+1)+": Extra token in ADD statement <br />";
				return 0;
			}
			
			// Get register to be stored in
			var store = code[i][1].charAt(1);
			
			// Get register for first number to be added
			var a1 = code[i][2].charAt(1);
			
			// Get binary value of second number to be added. Could be integer or register,
			// so call function to check and return binary value
			var temp = new Array(32);
			temp = getVal(code[i][3]);
			
			if (!temp) { return 0; }
			
			// Add 
			if (command == "ADC" ) {
				ADC(R[store], R[a1], temp, 0);
			} else {
				// Update conditional flags
				ADC(R[store], R[a1], temp, 1);
			}
			continue;
		}
		if (command == "ADD" || command == "ADDS" ) {
			// Check for complete statement
			if (!code[i][2] || !code[i][3] ) {
				console+="Line "+(i+1)+": Incomplete ADD statement <br />";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][4]) {
				console+="Line "+(i+1)+": Extra token in ADD statement <br />";
				return 0;
			}
			
			// Get register to be stored in
			var store = code[i][1].charAt(1);
			
			// Get register for first number to be added
			var a1 = code[i][2].charAt(1);
			
			// Get binary value of second number to be added. Could be integer or register,
			// so call function to check and return binary value
			var temp = new Array(32);
			temp = getVal(code[i][3]);
			
			if (!temp) { return 0; }
			
			// Add 
			if (command == "ADD" ) {
				ADD(R[store], R[a1], temp, 0);
			} else {
				// Update conditional flags
				ADD(R[store], R[a1], temp, 1);
			}
			continue;
		}
		if (command == "AND" || command == "ANDS") {
			// Check for complete statement
			if (!code[i][2] || !code[i][3] ) {
				console+="Line "+(i+1)+": Incomplete AND statement <br />";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][4]) {
				console+="Line "+(i+1)+": Extra token in AND statement <br />";
				return 0;
			}
			
			// Get register to be stored in
			var store = code[i][1].charAt(1);
			
			// Get register for first number to be anded
			var a1 = code[i][2].charAt(1);
			
			// Get binary value of second number to be anded. Could be integer or register,
			// so call function to check and return binary value
			var temp = new Array(32);
			temp = getVal(code[i][3]);
			
			if (!temp) { return 0; }
			
			// Call and function  
			if (command == "AND") {
				AND(R[store], R[a1], temp, 0);
			} else {
				AND(R[store], R[a1], temp, 1);
			}
			continue;
		}
		if (command == "ASR" || command == "ASRS") {
			// Check for complete statement
			if (!code[i][2] || !code[i][3]) {
				console+="Line "+(i+1)+": Incomplete ASR statement";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][4]) {
				console+="Line "+(i+1)+": Extra token in ASR statement";
				return 0;
			}
			
			// Get register to be stored in
			var store = code[i][1].charAt(1);
			
			// Get register for number to be shifted
			var a1 = code[i][2].charAt(1);
			
			// Get value to be shifted by - check to see if it's a number or register
			if (code[i][3].charAt(0) == '#') {
				var j = 1;
				var x = "";
				while (code[i][3].charAt(j)) {
					x += code[i][3].charAt(j);
					j++;
				}
			}
			
			// Check to see if value is register
			if (code[i][3].charAt(0) == 'R') {
				var r = code[i][3].charAt(1);
				var x = sVal(R[r]);
			}
			
			// Call shifting function
			if (command == "ASR") {
				ASR (R[store], R[a1], x, 0);
			} else {
				ASR (R[store], R[a1], x, 1);		// Update flags
			}
			continue;
		}
		if (command == "BIC") {
			// Check for complete statement
			if (!code[i][2] || !code[i][3] ) {
				console+="Line "+(i+1)+": Incomplete BIC statement <br />";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][4]) {
				console+="Line "+(i+1)+": Extra token in BIC statement <br />";
				return 0;
			}
			
			// Get register to be stored in
			var store = code[i][1].charAt(1);
			
			// Get register for first number to be anded
			var a1 = code[i][2].charAt(1);
			
			// Get binary value of second number to be anded. Could be integer or register,
			// so call function to check and return binary value
			var temp = new Array(32);
			temp = getVal(code[i][3]);
			
			if (!temp) { return 0; }
			
			// Call bic function  
			BIC(R[store], R[a1], temp);
			continue;
		}
		if (command == "BFC") {
			// Check for complete statement
			if (!code[i][2] || !code[i][3] ) {
				console+="Line "+(i+1)+": Incomplete BFC statement <br />";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][4]) {
				console+="Line "+(i+1)+": Extra token in BFC statement <br />";
				return 0;
			}
			
			// Get index of register whose bits are to be cleared
			var a1 = code[i][1].charAt(1);	
			
			// Get least significant bit. Has to be number, not register.
			if (code[i][2].charAt(0) != "#") {
				console += "Line "+(i+1)+": Specify LSB in BFC statement with pound sign like so: '#42'";
				return 0;
			}
			// Check to make sure that neither LSB or width is negative.
			if (code[i][2].charAt(1) == "-" || code[i][3].charAt(1) == "-") {
				console += "Line "+(i+1)+": No negatives allowed in BFC statements.";
				return 0;
			}
			var lsb = "";
			var j = 1;
			while (code[i][2].charAt(j)) {
				if (code[i][2].charAt(j) == ',') { break; }
				lsb += code[i][2].charAt(j);
				j++;
			}
			
			// Get width. Also has to be number, not register.
			if (code[i][3].charAt(0) != "#") {
				console += "Line "+(i+1)+": Specify width in BFC statement with pound sign like so: '#42'";
				return 0;
			}
			var width = "";
			j = 1;
			while (code[i][3].charAt(j)) {
				width += code[i][3].charAt(j);
				j++;
			}
			
			BFC(R[a1], lsb, width);
			continue;
		}
		if (command == "BFI") {
			// Check for complete statement
			if (!code[i][3] || !code[i][4] ) {
				console+="Line "+(i+1)+": Incomplete BFI statement <br />";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][5]) {
				console+="Line "+(i+1)+": Extra token in BFI statement <br />";
				return 0;
			}
			
			// Get index of register where bits are to be inserted
			var a1 = code[i][1].charAt(1);	
			// Get index of register from whom bits will be taken
			var a2 = code[i][2].charAt(1);	
			
			// Get least significant bit. Has to be number, not register.
			if (code[i][3].charAt(0) != "#") {
				console += "Line "+(i+1)+": Specify LSB in BFI statement with pound sign like so: '#42'";
				return 0;
			}
			// Check to make sure that neither LSB nor width is negative.
			if (code[i][3].charAt(1) == "-" || code[i][4].charAt(1) == "-") {
				console += "Line "+(i+1)+": No negatives allowed in BFI operations.";
				return 0;
			}
			var lsb = "";
			var j = 1;
			while (code[i][3].charAt(j)) {
				if (code[i][3].charAt(j) == ',') { break; }
				lsb += code[i][3].charAt(j);
				j++;
			}
			
			// Get width. Also has to be number, not register.
			if (code[i][4].charAt(0) != "#") {
				console += "Line "+(i+1)+": Specify width in BFI statement with pound sign like so: '#42'";
				return 0;
			}
			var width = "";
			j = 1;
			while (code[i][4].charAt(j)) {
				width += code[i][4].charAt(j);
				j++;
			}
			
			BFI(R[a1], R[a2], lsb, width);
			continue;
		}
		if (command == "CLZ") {
			// Check for complete statement
			if (!code[i][1] || !code[i][2] ) {
				console+="Line "+(i+1)+": Incomplete CLZ statement <br />";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][3]) {
				console+="Line "+(i+1)+": Extra token in CLZ statement <br />";
				return 0;
			}
			
			// Get index of register where result will be stored
			var a1 = code[i][1].charAt(1);	
			
			// Get binary value of number. Could be integer or register,
			// so call function to check and return binary value
			var temp = new Array(32);
			temp = getVal(code[i][2]);
			
			if (!temp) { return 0; }
			
			CLZ(R[a1], temp);
			continue;
		}
		if (command == "CMP") {
			// Get index of first register to be compared
			var a1 = code[i][1].charAt(1);
			if (!R[a1]) {
				console += "Line "+(i+1)+": Register not defined. <br/>";
			}						
			
			// Get binary value of second number to be compared. Could be integer or register,
			// so call function to check and return binary value
			var temp = new Array(32);
			temp = getVal(code[i][2]);
			
			if (!temp) { return 0; }
			
			var garbage = new Array(32);
			
			// Subtract second register from first, update flags
			SUB(garbage, R[a1], temp, 1);
			
			// Call compare function to update global compare flags
			CMP(R[a1], temp);
			continue;
		}
		if (command == "DIV") {
			// Check for complete statement
			if (!code[i][2] || !code[i][3]) {
				console+="Line "+(i+1)+": Incomplete DIV statement";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][4]) {
				console+="Line "+(i+1)+": Extra token in DIV statement";
				return 0;
			}
			
			// Get register to be stored in
			var store = code[i][1].charAt(1);
			
			// Get registers for numbers to be multiplied
			var a1 = code[i][2].charAt(1);
			//var a2 = code[i][3].charAt(1);
			
			// Get binary value of second number to be multiplied. Could be integer or register,
			// so call function to check and return binary value
			var temp = new Array(32);
			temp = getVal(code[i][3]);
			
			if (!temp) { return 0; }
			
			// Call signed multiply function
			DIV(R[store], R[a1], temp);
			continue;	
		}
		if (command == "SDIV") {
			// Check for complete statement
			if (!code[i][2] || !code[i][3]) {
				console+="Line "+(i+1)+": Incomplete SDIV statement";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][4]) {
				console+="Line "+(i+1)+": Extra token in SDIV statement";
				return 0;
			}
			
			// Get register to be stored in
			var store = code[i][1].charAt(1);
			
			// Get registers for numbers to be multiplied
			var a1 = code[i][2].charAt(1);
			//var a2 = code[i][3].charAt(1);
			
			// Get binary value of second number to be multiplied. Could be integer or register,
			// so call function to check and return binary value
			var temp = new Array(32);
			temp = getVal(code[i][3]);
			
			if (!temp) { return 0; }
			
			// Call signed multiply function
			SDIV(R[store], R[a1], temp);
			continue;	
		}
		if (command == "EOR") {
			// Check for complete statement
			if (!code[i][2] || !code[i][3] ) {
				console+="Line "+(i+1)+": Incomplete EOR statement <br />";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][4]) {
				console+="Line "+(i+1)+": Extra token in EOR statement <br />";
				return 0;
			}
			
			// Get register to be stored in
			var store = code[i][1].charAt(1);
			
			// Get register for first number to be anded
			var a1 = code[i][2].charAt(1);
			
			// Get binary value of second number to be anded. Could be integer or register,
			// so call function to check and return binary value
			var temp = new Array(32);
			temp = getVal(code[i][3]);
			
			if (!temp) { return 0; }
			
			// Call and function  
			EOR(R[store], R[a1], temp);
			continue;
		}
		if (command == "IT" || command == "ITT" || command == "ITTE" || command == "ITE" || command == "ITEE" || command == "IEE" || command == "ITTEE"){
			// Check for complete statement
			if (!code[i][1]) {
				console+="Line "+(i+1)+": Incomplete IT statement";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][2]) {
				console+="Line "+(i+1)+": Extra token in IT statement";
				return 0;
			}
			
			var comp = code[i][1];
			
			if (comp == "NE" || comp == "HI" || comp == "LS" || comp == "GT" || comp == "GE" || comp == "EQ" || comp == "LE" || comp == "LT") {
				// First, get number of T's and E's in command
				var size = code[i][0].length - 1;
				var j = 0;
				var t = 0;
				var e = 0;
				while (code[i][0].charAt(j) ) {
					if (code[i][0].charAt(j) == 'E') { e++; }
					if (code[i][0].charAt(j) == 'T') { t++; }
					j++;
				}
				
				// Check to see if comp is true or false
				var result = compCmd(comp);
				
				// If result is true, update skip flags and continue
				if (result) {
					alert("true");
					skip1 = i+t+1;					// skip iteration that is number of 'then' statements + 1 iterations in future
					if (e > 1) {					// if there is more than one 'else' specification, skip additional iteration
						skip2 = i+t+2;
					}
					continue;
				}
				
				// If condition is false, skip appropropriate number of next iterations
				if (!result) {
					i += t;
					alert("Going to "+i);
					
				
					//i += size;
					continue;
				}
			}
			
			continue;
		}
		if (command == "LSL" || command == "LSLS*") {
			// Check for complete statement
			if (!code[i][2] || !code[i][3]) {
				console+="Line "+(i+1)+": Incomplete LSL statement";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][4]) {
				console+="Line "+(i+1)+": Extra token in LSL statement";
				return 0;
			}
			
			// Get register to be stored in
			var store = code[i][1].charAt(1);
			
			// Get register for number to be shifted
			var a1 = code[i][2].charAt(1);
			
			// Get value to be shifted by - check to see if it's a number or register
			if (code[i][3].charAt(0) == '#') {
				var j = 1;
				var x = "";
				while (code[i][3].charAt(j)) {
					x += code[i][3].charAt(j);
					j++;
				}
			}
			
			// Check to see if value is register
			if (code[i][3].charAt(0) == 'R') {
				var r = code[i][3].charAt(1);
				var x = sVal(R[r]);
			}
			
			
			// Call shifting function
			if ( command == "LSL" ) {
				LSL (R[store], R[a1], x, 0);
				alert("Two");
			} else {
				LSL (R[store], R[a1], x, 1);
			}
			continue;
		}
		if (command == "LSR" || command == "LSRS") {
			// Check for complete statement
			if (!code[i][2] || !code[i][3]) {
				console+="Line "+(i+1)+": Incomplete LSR statement";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][4]) {
				console+="Line "+(i+1)+": Extra token in LSR statement";
				return 0;
			}
			
			// Get register to be stored in
			var store = code[i][1].charAt(1);
			
			// Get register for number to be shifted
			var a1 = code[i][2].charAt(1);
			
			// Get value to be shifted by - check to see if it's a number or register
			if (code[i][3].charAt(0) == '#') {
				var j = 1;
				var x = "";
				while (code[i][3].charAt(j)) {
					x += code[i][3].charAt(j);
					j++;
				}
			}
			
			// Check to see if value is register
			if (code[i][3].charAt(0) == 'R') {
				var r = code[i][3].charAt(1);
				var x = sVal(R[r]);
			}
			
			// Call shifting function
			if ( command == "LSR" ) {
				LSR (R[store], R[a1], x, 0);
			} else {
				LSR (R[store], R[a1], x, 1);
			}
			continue;
		}
		if (command == "MLA") {
			// Check for complete statement
			if (!code[i][4] || !code[i][4]) {
				console+="Line "+(i+1)+": Incomplete MLA statement";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][5]) {
				console+="Line "+(i+1)+": Extra token in MLA statement";
				return 0;
			}
			
			// Get register to be stored in
			var store = code[i][1].charAt(1);
			
			// Get registers for numbers to be multiplied
			var a1 = code[i][2].charAt(1);
			var a2 = code[i][3].charAt(1);
			
			// Get binary value of second number to be multiplied. Could be integer or register,
			// so call function to check and return binary value
			var temp = new Array(32);
			temp = getVal(code[i][4]);
			
			if (!temp) { return 0; }
			MLA (R[store], R[a1], R[a2], temp);
			continue;
		}
		if (command == "MLS") {
			// Check for complete statement
			if (!code[i][4] || !code[i][4]) {
				console+="Line "+(i+1)+": Incomplete MLS statement";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][5]) {
				console+="Line "+(i+1)+": Extra token in MLS statement";
				return 0;
			}
			
			// Get register to be stored in
			var store = code[i][1].charAt(1);
			
			// Get registers for numbers to be multiplied
			var a1 = code[i][2].charAt(1);
			var a2 = code[i][3].charAt(1);
			
			// Get binary value of second number to be multiplied. Could be integer or register,
			// so call function to check and return binary value
			var temp = new Array(32);
			temp = getVal(code[i][4]);
			
			if (!temp) { return 0; }
			MLS (R[store], R[a1], R[a2], temp);
			continue;
		}
		if (command == "MOV") {
			// Check for complete statement
			if (!code[i][2]) {
				console+="Line "+(i+1)+": Incomplete MOV statement";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][3]) {
				console+="Line "+(i+1)+": Extra token in MOV statement";
				return 0;
			}
			
			// Get register to be stored in
			var store = code[i][1].charAt(1);
			
			// Get registers for numbers to be multiplied
			var a1 = code[i][2].charAt(1);
			
			MOV(R[store], R[a1]);
			continue;
		}
		if (command == "MVN") {
			// Check for complete statement
			if (!code[i][2]) {
				console+="Line "+(i+1)+": Incomplete MVN statement";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][3]) {
				console+="Line "+(i+1)+": Extra token in MVN statement";
				return 0;
			}
			
			// Get register to be stored in
			var store = code[i][1].charAt(1);
			
			// Get registers for numbers to be multiplied
			var a1 = code[i][2].charAt(1);
			
			MVN(R[store], R[a1]);
			continue;
		}
		if (command == "MUL") {
			// Check for complete statement
			if (!code[i][2] || !code[i][3]) {
				console+="Line "+(i+1)+": Incomplete MUL statement";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][4]) {
				console+="Line "+(i+1)+": Extra token in MUL statement";
				return 0;
			}
			
			// Get register to be stored in
			var store = code[i][1].charAt(1);
			
			// Get registers for numbers to be multiplied
			var a1 = code[i][2].charAt(1);
			//var a2 = code[i][3].charAt(1);
			
			// Get binary value of second number to be multiplied. Could be integer or register,
			// so call function to check and return binary value
			var temp = new Array(32);
			temp = getVal(code[i][3]);
			
			if (!temp) { return 0; }
			
			// Call multiply function
			MUL(R[store], R[a1], temp);
			continue;	
		}
		if (command == "SMUL") {
			// Check for complete statement
			if (!code[i][2] || !code[i][3]) {
				console+="Line "+(i+1)+": Incomplete SMUL statement";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][4]) {
				console+="Line "+(i+1)+": Extra token in SMUL statement";
				return 0;
			}
			
			// Get register to be stored in
			var store = code[i][1].charAt(1);
			
			// Get registers for numbers to be multiplied
			var a1 = code[i][2].charAt(1);
			
			// Get binary value of second number to be multiplied. Could be integer or register,
			// so call function to check and return binary value
			var temp = new Array(32);
			temp = getVal(code[i][3]);
			
			if (!temp) { return 0; }
			
			// Call signed multiply function
			SMUL(R[store], R[a1], temp);
			continue;	
		}
		if (command == "NEG") {
			// Check for complete statement
			if (!code[i][2]) {
				console+="Line "+(i+1)+": Incomplete NEG statement";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][3]) {
				console+="Line "+(i+1)+": Extra token in NEG statement";
				return 0;
			}
			
			// Get register to be stored in
			var store = code[i][1].charAt(1);
			
			// Get registers for 
			var a1 = code[i][2].charAt(1);
			
			MOV(R[store], R[a1]);
			twoComp(R[store]);
			continue;
		}
		if (command == "ORR") {
			// Check for complete statement
			if (!code[i][2] || !code[i][3] ) {
				console+="Line "+(i+1)+": Incomplete ORR statement <br />";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][4]) {
				console+="Line "+(i+1)+": Extra token in ORR statement <br />";
				return 0;
			}
			
			// Get register to be stored in
			var store = code[i][1].charAt(1);
			
			// Get register for first number to be anded
			var a1 = code[i][2].charAt(1);
			
			// Get binary value of second number to be anded. Could be integer or register,
			// so call function to check and return binary value
			var temp = new Array(32);
			temp = getVal(code[i][3]);
			
			if (!temp) { return 0; }
			
			// Call or function  
			ORR(R[store], R[a1], temp);
			continue;
		}
		if (command == "ORN") {
			// Check for complete statement
			if (!code[i][2] || !code[i][3] ) {
				console+="Line "+(i+1)+": Incomplete ORN statement <br />";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][4]) {
				console+="Line "+(i+1)+": Extra token in ORN statement <br />";
				return 0;
			}
			
			// Get register to be stored in
			var store = code[i][1].charAt(1);
			
			// Get register for first number to be anded
			var a1 = code[i][2].charAt(1);
			
			// Get binary value of second number to be anded. Could be integer or register,
			// so call function to check and return binary value
			var temp = new Array(32);
			temp = getVal(code[i][3]);
			
			if (!temp) { return 0; }
			
			// Call orn function  
			ORN(R[store], R[a1], temp);
			continue;
		}
		if (command == "PF") {
			printFlags();
			continue;
		}
		if (command == "PR" ) {
			var j = code[i][1].charAt(1);
			printRegister(R[j]);
			continue;
		}
		if (command == "PS" ) {
			printStack();
			continue;
		}
		if (command == "POP") {			
			// Check for closing curly brace
			var length = code[i].length - 1;
			if (code[i][length] != '}') {
				console+="Line "+(i+1)+": POP statement must end with a curly brace separated by a space";
				return 0;
			}
			// Check for opening curly brace
			if (code[i][1] != '{') {
				console+="Line "+(i+1)+": Declaration of registers in POP statement must be preceeded by a curly brace separated by a space";
				return 0;
			}
			// Check for complete statement
			if (!code[i][3]) {
				console+="Line "+(i+1)+": Incomplete POP statement";
				return 0;
			}
			
			// Determine number of registers to be popped and create data structure of appropriate size
			var x = length - 3;
			var registers = new Array(x);			
			
			// Eventually, they'll be popped in sorted order. 
			var k = 0;
			for (var j = 2; j < length; j++) {
				registers[k] = code[i][j].charAt(1);
				k++;
			}
			
			for (var j = x; j >= 0; j--) {
				POP (R[registers[j]]);
			}
			
			continue;
		}
		if (command == "PUSH") {
			// Check for closing curly brace
			var length = code[i].length - 1;
			if (code[i][length] != '}') {
				console+="Line "+(i+1)+": PUSH statement must end with a curly brace separated by a space";
				return 0;
			}
			// Check for opening curly brace
			if (code[i][1] != '{') {
				console+="Line "+(i+1)+": Declaration of registers in PUSH statement must be preceeded by a curly brace separated by a space";
				return 0;
			}
			// Check for complete statement
			if (!code[i][3]) {
				console+="Line "+(i+1)+": Incomplete PUSH statement";
				return 0;
			}
			
			// Determine number of registers to be pushed and create data structure of appropriate size
			var x = length - 3;
			var registers = new Array(x);			
			
			var k = 0;
			for (var j = 2; j < length; j++) {
				registers[k] = code[i][j].charAt(1);
				k++;
			}
			
			for (var j = 0; j <= x; j++) {
				PUSH (R[registers[j]]);
			}
			
			continue;
		}
		if (command == "RBIT") {
			// Check for complete statement
			if (!code[i][2]) {
				console+="Line "+(i+1)+": Incomplete RBIT statement";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][3]) {
				console+="Line "+(i+1)+": Extra token in RBIT statement";
				return 0;
			}
			
			// Get register to be stored in
			var store = code[i][1].charAt(1);
			
			// Get registers for numbers to be reversed
			var a1 = code[i][2].charAt(1);
			
			RBIT(R[store], R[a1]);
			continue;
		}
		if (command == "REV") {
			// Check for complete statement
			if (!code[i][2]) {
				console+="Line "+(i+1)+": Incomplete REV statement";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][3]) {
				console+="Line "+(i+1)+": Extra token in REV statement";
				return 0;
			}
			
			// Get register to be stored in
			var store = code[i][1].charAt(1);
			
			// Get registers for numbers to be reversed
			var a1 = code[i][2].charAt(1);
			
			REV(R[store], R[a1]);
			continue;
		}
		if (command == "REV16") {
			// Check for complete statement
			if (!code[i][2]) {
				console+="Line "+(i+1)+": Incomplete REV16 statement";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][3]) {
				console+="Line "+(i+1)+": Extra token in REV16 statement";
				return 0;
			}
			
			// Get register to be stored in
			var store = code[i][1].charAt(1);
			
			// Get registers for numbers to be reversed
			var a1 = code[i][2].charAt(1);
			
			REV16(R[store], R[a1]);
			continue;
		}
		if (command == "ROR") {
			// Check for complete statement
			if (!code[i][2] || !code[i][3]) {
				console+="Line "+(i+1)+": Incomplete ROR statement";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][4]) {
				console+="Line "+(i+1)+": Extra token in ROR statement";
				return 0;
			}
			
			// Get register to be stored in
			var store = code[i][1].charAt(1);
			
			// Get register for number to be shifted
			var a1 = code[i][2].charAt(1);
			
			// Get value to be shifted by - check to see if it's a number or register
			if (code[i][3].charAt(0) == '#') {
				var j = 1;
				var x = "";
				while (code[i][3].charAt(j)) {
					x += code[i][3].charAt(j);
					j++;
				}
			} 			
			// Check to see if value is register
			else if (code[i][3].charAt(0) == 'R') {
				var r = code[i][3].charAt(1);
				var x = sVal(R[r]);
			} else {
				console += "Line "+(i+1)+": Specify a register or number.";
				return 0;
			}
			
			// Call rotating function
			ROR(R[store], R[a1], x);
			continue;
		}
		if (command == "RRX") {
			// Check for complete statement
			if (!code[i][2]) {
				console+="Line "+(i+1)+": Incomplete RRX statement";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][3]) {
				console+="Line "+(i+1)+": Extra token in RRX statement";
				return 0;
			}
			
			// Get register to be stored in
			var store = code[i][1].charAt(1);
			
			// Get register for number to be shifted
			var a1 = code[i][2].charAt(1);
			
			// Call rotating function - shift right by one
			ROR(R[store], R[a1], 1);
			continue;
		}
		if (command == "RSB" || command == "RSBS") {
			// Check for complete statement
			if (code[i][2] == "" || code[i][3] == "") {
				console+="Line "+(i+1)+": Incomplete RSB statement";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][4]) {
				console+="Line "+(i+1)+": Extra token in RSB statement";
				return 0;
			}
			
			// Get register to be stored in
			var store = code[i][1].charAt(1);
			
			// Get registers for numbers to be stored in
			var a1 = code[i][2].charAt(1);
			
			// Get binary value of second number to be multiplied. Could be integer or register,
			// so call function to check and return binary value
			var temp = new Array(32);
			temp = getVal(code[i][3]);
			
			if (!temp) { return 0; }
			
			// Subtract
			if (command == "RSB") {
				RSB(R[store], R[a1], temp, 0);
			} else {
				RSB(R[store], R[a1], temp, 1);
			}
			continue;
		}
		if (command == "SMLAL") {
			// Check for complete statement
			if (!code[i][3] || !code[i][4]) {
				console+="Line "+(i+1)+": Incomplete SMLAL statement";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][5]) {
				console+="Line "+(i+1)+": Extra token in SMLAL statement";
				return 0;
			}
			
			// Get registers where values will be stored
			var s = code[i][1].charAt(1);
			var t = code[i][2].charAt(1);			
			
			// Get registers for numbers to be multiplied
			var a = code[i][3].charAt(1);
			
			// Get binary value of second number to be multiplied. Could be integer or register,
			// so call function to check and return binary value
			var temp = new Array(32);
			temp = getVal(code[i][4]);
			
			if (!temp) { return 0; }
			
			// Call signed multiply function
			SMLAL(R[s], R[t], R[a], temp);
			continue;	
		}
		if (command == "SMULL") {
			// Check for complete statement
			if (!code[i][3] || !code[i][4]) {
				console+="Line "+(i+1)+": Incomplete SMULL statement";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][5]) {
				console+="Line "+(i+1)+": Extra token in SMULL statement";
				return 0;
			}
			
			// Get registers where values will be stored
			var s = code[i][1].charAt(1);
			var t = code[i][2].charAt(1);			
			
			// Get registers for numbers to be multiplied
			var a = code[i][3].charAt(1);
			
			// Get binary value of second number to be multiplied. Could be integer or register,
			// so call function to check and return binary value
			var temp = new Array(32);
			temp = getVal(code[i][4]);
			
			if (!temp) { return 0; }
			
			// Call signed multiply function
			SMULL(R[s], R[t], R[a], temp);
			continue;	
		}
		if (command == "SXTB") {
			// Check for complete statement
			if (!code[i][2]) {
				console+="Line "+(i+1)+": Incomplete SXTB statement";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][3]) {
				console+="Line "+(i+1)+": Extra token in SXTB statement";
				return 0;
			}
			
			// Get register to be stored in
			var store = code[i][1].charAt(1);
			
			// Get registers for number to be extended
			var a1 = code[i][2].charAt(1);
			
			SXTB(R[store], R[a1]);
			continue;
		}
		if (command == "SXTH") {
			// Check for complete statement
			if (!code[i][2]) {
				console+="Line "+(i+1)+": Incomplete SXTH statement";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][3]) {
				console+="Line "+(i+1)+": Extra token in SXTH statement";
				return 0;
			}
			
			// Get register to be stored in
			var store = code[i][1].charAt(1);
			
			// Get registers for number to be extended
			var a1 = code[i][2].charAt(1);
			
			SXTH(R[store], R[a1]);
			continue;
		}
		if (command == "SUB" || command == "SUBS") {
			// Check for complete statement
			if (code[i][2] == "" || code[i][3] == "") {
				console+="Line "+(i+1)+": Incomplete SUB statement";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][4]) {
				console+="Line "+(i+1)+": Extra token in SUB statement";
				return 0;
			}
			
			// Get register to be stored in
			var store = code[i][1].charAt(1);
			
			// Get registers for numbers to be stored in
			var a1 = code[i][2].charAt(1);
			
			var Ra = new Array(32);
			Ra = checkRegister(code[i][2]);
			if (!Ra) {
				return 0;
			}
			
			// Get binary value of second number to be multiplied. Could be integer or register,
			// so call function to check and return binary value
			var temp = new Array(32);
			temp = getVal(code[i][3]);
			
			if (!temp) { return 0; }
			
			// Call subtract function
			if (command == "SUB") {
				SUB(R[store], Ra, temp, 0);
			} else {
				SUB(R[store], Ra, temp, 1);
			}
			continue;
		}
		if (command == "UMULL") {
			// Check for complete statement
			if (!code[i][3] || !code[i][4]) {
				console+="Line "+(i+1)+": Incomplete UMULL statement";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][5]) {
				console+="Line "+(i+1)+": Extra token in UMULL statement";
				return 0;
			}
			
			// Get registers where values will be stored
			var s = code[i][1].charAt(1);
			var t = code[i][2].charAt(1);			
			
			// Get registers for numbers to be multiplied
			var a = code[i][3].charAt(1);
			var b = code[i][4].charAt(1);
			
			// Call unsigned multiply function
			UMULL(R[s], R[t], R[a], R[b]);
			continue;	
		}
		if (command == "UXTB") {
			// Check for complete statement
			if (!code[i][2]) {
				console+="Line "+(i+1)+": Incomplete UXTB statement";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][3]) {
				console+="Line "+(i+1)+": Extra token in UXTB statement";
				return 0;
			}
			
			// Get register to be stored in
			var store = code[i][1].charAt(1);
			
			// Get register for number to be extended
			var a1 = code[i][2].charAt(1);
			
			UXTB(R[store], R[a1]);
			continue;
		}
		if (command == "UXTH") {
			// Check for complete statement
			if (!code[i][2]) {
				console+="Line "+(i+1)+": Incomplete UXTH statement";
				return 0;
			}
			// Check that there are no extra arguments
			if (code[i][3]) {
				console+="Line "+(i+1)+": Extra token in UXTH statement";
				return 0;
			}
			
			// Get register to be stored in
			var store = code[i][1].charAt(1);
			
			// Get register for number to be extended
			var a1 = code[i][2].charAt(1);
			
			UXTH(R[store], R[a1]);
			continue;
		}
		if (command == "uVal" ) {
			var r = code[i][1].charAt(1);

			// Check that register has been defined. If not, return.
			if (R[r][0] == undefined) {
				console+="Register undefined, can't calculate unsigned value. <br />";
				return;
			}
			
			var val = uVal(R[r]);
			console+=val+"<br/>";
			
			continue;
		}
		if (command == "sVal" ) {
			var r = code[i][1].charAt(1);

			// Check that register has been defined. If not, return.
			if (R[r][0] == undefined) {
				console+="Line "+(i+1)+": Register undefined, can't calculate signed value. <br />";
				return;
			}
			
			var val = sVal(R[r]);
			console+=val+"<br/>";
			
			continue;
		}
		if (command == "sVal64" ) {
			var r = code[i][1].charAt(1);

			// Check that register has been defined. If not, return.
			if (!R[r][0]) {
				console+="Line "+(i+1)+": Register undefined, can't calculate signed value. <br />";
				return;
			}
			
			var val = sVal(R[r]);
			console+=val+"<br/>";
			
			continue;
		}
		console += "Line "+(i+1)+": Command not found. <br />";
	}
}

// 
function parseSource() {
	var temp;
	var identifier, j;
	var type;
	for (var i = 0; i < source.length; i++) {
		// Split current line into section before equals sign and section after
		source[i] = source[i].split("=");
		
		// If statement is not ended by a semi-colon, notify and return.
		if (source[i][1].charAt( source[i][1].length-1 ) != ';') {
			console += "Line "+(i+1)+": You forgot a semi-colon. <br/>";
			return 0;
		}
		
		// Split first section by spaces
		temp = source[i][0].split(" ");
		
		// Get identifier
		j = 1;
		while (	!temp[ temp.length - j ].charAt(0)) {
			j++;
		}
		identifier = temp[ temp.length - j ]; 
		S[counter][0] = identifier;
		
		// Get variable type
		j = 0;
		// If signed or unsigned is specified, completely ignore
		if (temp[0] == "unsigned" || temp[0] == "signed") {
			j = 1;
		}
		type = "";
		while (temp[j] != identifier) {
			type += temp[j]+" ";
			j++
		}
		if (type == "float ") {
			console += "Error: floats not supported. ";
			return 0;
		} else if (type == "double " || type == "long double ") {
			console += "Error: doubles not supported. ";
			return 0;			
		}
		//type = C[counter][0];		
		
		// Get characters that make up number
		var num = "";
		var negative = false;
		j = 0;
		if (source[i][1].charAt(0) == ' ') {
			j = 1;
		} 
		if (source[i][1].charAt(j) == '-') {
			//j = 2;
			negative = true;
		}
		while (source[i][1].charAt(j) != ';') {
			num += source[i][1].charAt(j);
			j++;
		}
		if (negative) {
			num *= -1;
		}
		
		// Convert num to 64-bit binary
		var holder = new Array(64);
		getBinary(num,holder);
		
		// Load binary value into variable based on size specified
		var binary = new Array(32);
		if (type == "long long " || type == "long long int ") {
			if (negative) {
				twoComp(holder);
			}
			S[counter][1] = holder;
		} else if (type == "int " || type == "long int " || type == "long ") {
			getBinary(num, binary);
			if (negative) {
				twoComp(binary);
			}
			S[counter][1] = binary;
		} else if (type == "short " || type == "short int ") {
			var temp = new Array(32);
			getBinary(num, binary);
			if (negative) {
				twoComp(binary);
			}
			// Only keep least significant half
			LDRH(temp, binary);
			S[counter][1] = temp;
		} 
		
		counter++;
	}
	return true;
}


function doThings() {
	// Clear data structure containing values from C input by resetting counter to 0
	counter = 0;
	
	// Clear flags
	clearFlags();
	
	// Reset stack count to clear stack
	stackCount = 0;
	
	// Get code as string from c-input box
	var s = document.forms["mainForm"]["cForm"].value;
	if (s) {
		// Place in global array called 'source', with each line in separate index
		source = s.split("\n");
		var result = parseSource();
		if (!result) {
			document.getElementById("results").innerHTML=console;
			console = "";
			return 0;
		}
	}
	
	// Get code as a string from input box
	var c = document.forms["mainForm"]["input"].value;	
	// Place in global array called 'code', with each line in separate index
	code = c.split("\n");
	document.getElementById("results").innerHTML="Uh oh, something went wrong during interpretation. =[";

	// For each line in code, split into new array of strings
	for (var i = 0; i < code.length; i++) {
		code[i] = code[i].split(" ");
		//document.getElementById("results").innerHTML=""+code[i]+"<br/>";
	}
	
	executeCode();
	document.getElementById("results").innerHTML=console;

	console = "";

	return 0;
}

