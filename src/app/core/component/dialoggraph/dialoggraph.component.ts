import { Component, OnInit, ViewChild, ElementRef, AfterContentInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import { DraggedEdge, edgeId } from '@ustutt/grapheditor-webcomponent/lib/edge';
import * as d3 from 'd3';
import GraphEditor from '@ustutt/grapheditor-webcomponent/lib/grapheditor';


@Component({
  selector: 'pp-dialoggraph',
  templateUrl: './dialoggraph.component.html',
  styleUrls: ['./dialoggraph.component.scss']
})
export class DialoggraphComponent implements OnInit {

  @ViewChild('graphWrapper', { static: true })
  graph: ElementRef;

  @ViewChild('svg')
  svg: ElementRef;
  graphElement: GraphEditor;
  nodes: any;
  highlightedNodes: any;
  edges: any;
  edgeInformation: any;
  optionalIds: any;
  algoName: string;
  href: string;

  constructor(public dialogRef: MatDialogRef<DialoggraphComponent>,
             @Inject(MAT_DIALOG_DATA) public data) { 
      if(data != null){
          // deepcopy... slice doesnt work for objects/arrays
          this.nodes = data.nodes;
          this.edges = data.edges;
          this.edgeInformation = data.edgeInformation;
		  this.highlightedNodes = data.highlightedNodes;
		  this.optionalIds = data.optionalNodeIds;
		  this.algoName = data.name;
		  this.href = data.href;
		  
		  // set level for each node
		  /*
          this.nodes.forEach(node => {
            data.levelgraph.forEach( lnode => {
              if(lnode.nodeid == node.id){
                node.level = lnode.level;
              }
            });
          });
		  */
      }
  }

  ngOnInit(): void {
  }
  
  openLink(){
	  let url = this.href;
	  //let url = "https://platform.planqk.de/algorithms/786e1ff5-991e-428d-a538-b8b99bc3d175/";
	  window.open(url, '_blank');
  }
  
  close(openAgain: any){
	  this.dialogRef.close(openAgain);
  }
  
  handleNodeClickedEvent2(event) {
    const node = event['detail']['node'];
    if (event['detail']['key'] === 'info2') {
	  this.close(node);
      return;
    }
	return;
  }

  ngAfterContentInit() {
	//let currentEdges2 = [].concat(this.edges);
	let currentEdges2 = this.edges;
    let edgeInformation = this.edgeInformation;
	console.log("edgeInformation");
	console.log(edgeInformation);
	console.log("alledges");
	console.log(this.edges);
	
	const exceptionIds = ["05e07b55-83cf-4e7b-8212-a7a0e908139f", "a82ecee7-1a0d-4ba6-83b9-49b20b420047",
	"dd5b2a19-a01a-4d26-b968-31b53d976815", "70f81341-8ca3-4f47-9ac6-2d598fa31617", "bf873faa-68a1-466d-b8d1-7cc3c5de2c05", "b15bb40f-ca2c-41d2-b16b-a4da29ad1598",
	"39bd3758-fa63-4d44-bd98-95616134a39d", "9186fde3-7b56-43bc-8c60-d45a8405c473", "ef3d426f-0733-45b0-89ec-d2e81a607d16", "45cdc264-bb7d-40b9-9a98-d25e586fab15",
	];
	//const exceptionIds = [""];
	
	currentEdges2.forEach( edge => {
		if(exceptionIds.includes(edge.id) == false){
			let oldsource = edge.source;
			let oldsourcehandle = edge.sourceHandle
			edge.source = edge.target;
			edge.sourceHandle = edge.targetHandle;
			edge.target = oldsource;
			edge.targetHandle = oldsourcehandle;
		}
		else{
			console.log(edge.id);
		}
	});
	
	
	let edgesToRemove = [];
	edgesToRemove.push("d82208b3-d9aa-454d-9489-d4f6bb43adde"); // entferne beidseitige realated to zwischen oracle und function table

          currentEdges2.forEach(edge => {
			//console.log("currentegdes2");  
            //console.log(edge);
            //undefined???
            edgeInformation.forEach(node => {
			  //console.log("edgeinformationinnen");	
              //console.log(node);
              if(((node.nodeid == edge.source) || (node.nodeid == edge.target)) && this.highlightedNodes.includes(node.nodeid)) {
                //console.log("komm ich hier rein?");
                node.edges.forEach(edgedescription => {
					/*
                  if(edgedescription.edge.type == "refines") {
                    console.log("swap here refines");
                    let oldsource = edge.source;
					let oldsourcehandle = edge.sourceHandle
                    edge.source = edge.target;
					edge.sourceHandle = edge.targetHandle;
                    edge.target = oldsource;
					edge.targetHandle = oldsourcehandle;
                  }
				  if(edgedescription.edge.type == "uses") {
                    console.log("swap here uses");
                    let oldsource = edge.source;
					let oldsourcehandle = edge.sourceHandle
                    edge.source = edge.target;
					edge.sourceHandle = edge.targetHandle;
                    edge.target = oldsource;
					edge.targetHandle = oldsourcehandle;
                  }
				  if(edgedescription.edge.type == "canBeUsedWith") {
                    console.log("swap here canbeusedwith");
                    let oldsource = edge.source;
					let oldsourcehandle = edge.sourceHandle;
                    edge.source = edge.target;
					edge.sourceHandle = edge.targetHandle;
                    edge.target = oldsource;
					edge.targetHandle = oldsourcehandle;
                  }
				  if(edgedescription.edge.type == "consistsOf") {
                    console.log("swap here consistsOf");
                    let oldsource = edge.source;
					let oldsourcehandle = edge.sourceHandle
                    edge.source = edge.target;
					edge.sourceHandle = edge.targetHandle;
                    edge.target = oldsource;
					edge.targetHandle = oldsourcehandle;
                  }
				  if(edgedescription.edge.type == "dependsOn") {
                    console.log("swap here dependson");
                    let oldsource = edge.source;
					let oldsourcehandle = edge.sourceHandle
                    edge.source = edge.target;
					edge.sourceHandle = edge.targetHandle;
                    edge.target = oldsource;
					edge.targetHandle = oldsourcehandle;
                  }
				  */
				  if(edgedescription.edge.type == "isRelatedTo") {
					  //edgesToRemove.push(edge.id);
				  }
                });
              }
            });
          });
	
	  //this.edges = currentEdges2;
	  //this.edges = this.edges.map( edge => edge["id"] ? edge["id"] : edgeId(edge["id"]));
	  console.log("edgesToRemove");
	  console.log(edgesToRemove);
	  currentEdges2.forEach( edge => {
		  if(edgesToRemove.includes(edge.id)){
			  let index5 = currentEdges2.indexOf(edge);
			  currentEdges2.splice(index5,1);
		  }
	  });
	  console.log(currentEdges2);
	  
	  //console.log("swapped edges:");
	  //console.log(currentEdges2);
	  //console.log(this.edges);
	  
		 
      		 
	  let tempnodes = [].concat(this.highlightedNodes);
	  let tempedges = [].concat(currentEdges2);
	  let levelgraph = [];
	  for (let i = 1; i <= this.highlightedNodes.length; i++){
		let nodesToRemove = [];  
		//console.log("in for schleife");
		//console.log(tempnodes);
		//console.log(tempedges);
		//console.log(i);
		tempnodes.forEach( node => {
			let hasnoincomingedge = true;
			tempedges.forEach( edge => {
				if(edge["target"] == node){
					hasnoincomingedge = false;
				}
			});
			if(hasnoincomingedge){
				levelgraph.push({nodeid: node, level: i});
				nodesToRemove.push(node);
			}
		});
		nodesToRemove.forEach( node => {
			tempedges = tempedges.filter( edge => edge["source"] != node);
			let index = tempnodes.indexOf(node);
			tempnodes.splice(index,1);
		});
	  }
	  //add remaining nodes (most likely because of cyclic dependencies)
	  tempnodes.forEach(node => levelgraph.push({nodeid: node, level: 100}));
	  console.log("Levelgraph:");
	  console.log(levelgraph);
	  this.nodes.forEach(node => {
		  levelgraph.forEach( lnode => {
			  if(lnode.nodeid == node.id){
				  node.level = lnode.level;
				  lnode.actualNode = node;
			  }
		  });
	  });
	  
	  let currentnodes = [];
	  levelgraph.forEach(entry => currentnodes.push(entry.actualNode));
	  
	  console.log("check nodes");
	  console.log(this.nodes);
	  console.log(currentnodes);
	  //create graph
	  this.graphElement = this.graph.nativeElement;
        if (this.graphElement == null) {
            return;
        }
        let currentX = 0;
        let currentY = 0;
        for (let i = 1 ; i <= currentnodes.length; i++) {
            currentnodes.forEach(node => {
                if (node.level == i) {
                    node.x = currentX;
                    node.y = currentY;
                    currentY += 100;
					node.class = "optional-node";
                }
            });
            currentY = 0;
            currentX += 200;
        }
       
      
      this.graphElement.setNodes(currentnodes);
      this.graphElement.setEdges(this.edges);
	  
	  // optionale patterns müssen irgendwo gespeichert werden!
	  const optionalNodeIds = this.optionalIds;
	  if((optionalNodeIds != undefined)) {
		  this.graphElement.setNodeClass = (className, node) => {
		      if (optionalNodeIds.length > 0) {
			      if (className === 'optional-node') {
                      return optionalNodeIds.includes(node.id as string);
                  }
              }
              return false;
          };
	  }
	  
  }
}
