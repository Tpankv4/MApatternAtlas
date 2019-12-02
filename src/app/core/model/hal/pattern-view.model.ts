import Pattern from './pattern.model';
import UriEntity from './uri-entity.model';
import {HalLink} from './hal-link.interface';

export class PatternView extends UriEntity {
    patterns: Pattern[];
    _links: {
        self: HalLink;
        patternViews: HalLink;
        patterns: HalLink;
        directedEdges: HalLink;
        undirectedEdges: HalLink;
    };
}
