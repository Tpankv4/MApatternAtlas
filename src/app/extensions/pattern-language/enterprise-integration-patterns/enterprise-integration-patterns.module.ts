import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentRegistryService } from 'src/app/core/service/component-registry.service';
import { IriConverter } from 'src/app/core/util/iri-converter';
import { EnterpriseIntegrationPatternsComponent } from './component/enterprise-integration-patterns/enterprise-integration-patterns.component';
import { GraphComponent } from './component/graph/graph.component';
import { LinkVisualComponent } from './component/link-visual/link-visual.component';
import { NodeVisualComponent } from './component/node-visual/node-visual.component';
import { NodeInfoboxComponent } from './component/node-infobox/node-infobox.component';
import { EnterpriseIntegrationPatternComponent } from './component/enterprise-integration-pattern/enterprise-integration-pattern.component';

@NgModule({
  declarations: [EnterpriseIntegrationPatternsComponent, GraphComponent, LinkVisualComponent, NodeVisualComponent, NodeInfoboxComponent, EnterpriseIntegrationPatternComponent],
  imports: [
    CommonModule
  ]
})
export class EnterpriseIntegrationPatternsModule {
  constructor(private cr: ComponentRegistryService) {
    // register module as rendering for Enterprise Integration Patterns in registry
    this.cr.registerComponent(IriConverter.convertIriToId('http://purl.org/patternpedia/enterpriseintegrationpatterns#EnterpriseIntegrationPatterns'), {
      plcomponent: EnterpriseIntegrationPatternsComponent, // the rendering for the pattern LANGUAGE
      pcomponent: EnterpriseIntegrationPatternComponent // TODO is this actually used?
    });
  }
}