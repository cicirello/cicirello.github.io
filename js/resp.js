function toggleMenu() {
	var x = document.getElementById("topNav");
	if (x.className === "") {
		x.className += "open";
	} else {
		x.className = "";
	}
}