import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { Link } from '../../model/link';
import { Node } from '../../model/node';
import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';
import { EnterpriseIntegrationPatternsLoaderService } from '../../loader/enterprise-integration-patterns-loader.service';
import EnterpriseIntegrationPattern from '../../model/enterprise-integration-pattern';
import { EnterpriseIntegrationPatternsLinkLoaderService } from '../../loader/enterprise-integration-patterns-link-loader.service';
import { EnterpriseIntegrationPatternsGroupLoaderService } from '../../loader/enterprise-integration-patterns-group-loader.service';
import { Router, ActivatedRoute } from '@angular/router';
import { EnterpriseIntegrationPatternsDataService } from '../../service/enterprise-integration-patterns-data.service';
import { PatternRenderingComponentInterface } from 'src/app/core/model/pattern-rendering-component.interface';
import { EnterpriseIntegrationPatternLoaderService } from '../../loader/enterprise-integration-pattern-loader.service';
import { GraphComponent } from '../graph/graph.component';
import { PatternOntologyService } from 'src/app/core/service/pattern-ontology.service';

@Component({
  selector: 'pp-enterprise-integration-patterns',
  templateUrl: './enterprise-integration-patterns.component.html',
  styleUrls: ['./enterprise-integration-patterns.component.scss']
})
export class EnterpriseIntegrationPatternsComponent implements PatternRenderingComponentInterface, OnInit {

  // id of the pattern that is currently selected. We use the Network-Graph for displaying individual patterns too. Via Infobox.
  pId: string;

  data: { nodes: Node[], links: Link[], id?: string };

  patternMap: Map<string, EnterpriseIntegrationPattern>;
  linkMap: Map<string, Link>;
  groupMap: Map<string, any>;

  nodes: Node[];
  links: Link[];

  @ViewChild('graph') graph;

  filterValue: string;

  constructor(private http: HttpClient,
    private pos: PatternOntologyService,
    private loader: EnterpriseIntegrationPatternsDataService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private zone: NgZone,
    private patternLoader: EnterpriseIntegrationPatternLoaderService) { }

  ngOnInit() {
    this.pos.getOWLImports('http://purl.org/patternpedia/patternlanguages/enterpriseintegrationpatterns')
      .then(res => {
        const importedPatternIris = res.map(i => i.import);
        this.pos.loadUrisToStore(importedPatternIris)
          .then(() => {
            this.loader.getAllData()
              .then(values => {
                this.patternMap = values[0];
                this.linkMap = values[1];
                this.groupMap = values[2];

                // links
                // links also contains edges to different pattern languages. we don't want to render them as actual links of the network graph
                // => filter clp links
                this.links = Array.from(this.linkMap.values()).filter(link => {
                  let source = "";
                  let target = "";

                  if (typeof link.source === 'string')
                    source = link.source;
                  else if (link.source instanceof Node)
                    source = link.source.id;

                  if (typeof link.target === 'string')
                    target = link.target;
                  else if (link.target instanceof Node)
                    target = link.target.id;

                  // keep link, if its source and destination is from enterpriseintegrationpatterns, and no other language
                  return source.includes('enterpriseintegrationpatterns') && target.includes('enterpriseintegrationpatterns');
                });

                // groups
                let groups = {};
                this.groupMap.forEach(value => {
                  groups[value.groupName] = value.patterns;
                });

                // for coloring of nodes
                let groupIds = Array.from(Object.keys(groups));
                let scale = d3.scaleOrdinal(d3.schemeCategory10);
                let color = function (d: any) {
                  if (d)
                    return scale('' + groupIds.indexOf(d));
                  return scale('0');
                }

                // nodes
                this.nodes = [];

                // convert given IRI -> EnterpriseIntegrationPattern Map to Node list for rendering
                this.patternMap.forEach((value) => {
                  let n = new Node(value.id);
                  n.name = value.name;
                  n.description = value.description.value;

                  // go through all groups and check if the current pattern is present in the list of patterns
                  // return the group (i.e. the group name) that contains the pattern. undefined if no group contains this pattern
                  n.group = Object.keys(groups).find(groupName => groups[groupName].includes(value.id));

                  n.color = color(n.group);

                  this.nodes.push(n);
                });

                // place data in field
                this.data = {
                  nodes: this.nodes,
                  links: this.links,
                  id: this.pId
                };
              });
          });
      });
  }

  // called when a node from the network graph was selected
  selectNode(nodeId: string) {
    // TODO navigate to pattern via router
    console.log(nodeId);
    // should not be relative, as we might click multiple nodes!
    this.zone.run(() => {
      let route = this.pId ? ['..', nodeId] : [nodeId];
      this.router.navigate(route, { relativeTo: this.activatedRoute });
    });
  }

  // called when a node was unselected i.e. when clicked somewhere else
  unselectNode() {
    // TODO navigate back to language level
  }

  navigateBack(): void {
    this.zone.run(() => {
      this.router.navigate(['..'], { relativeTo: this.activatedRoute });
    });
  }

  filterNodes(value: string) {
    if (value !== '' /*&& this.filterValue !== value*/) {
      this.filterValue = value;

      this.graph.filterNodes(this.filterValue);
    } else {
      this.graph.showAllNodes();
    }
  }
}