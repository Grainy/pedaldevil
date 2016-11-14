<?php
	$conn1=new MySQLi("localhost","Steve","Wold0raps!","highcloud");
	if($conn1->connect_errno){
	    echo mysqli_connect_error();
	    exit;
	}
	$res=$conn1->query("show tables") or die($conn1->error);
	while($tables=$res->fetch_array()){
	    $conn1->query("ALTER TABLE $tables[0] CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci") or die($conn1->error);
	}
	echo "The collation of your database has been successfully changed!";
	
	$res->free();
	$conn1->close();

?>