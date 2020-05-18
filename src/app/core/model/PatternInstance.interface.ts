import Pattern from './pattern.model';
import { UriConverter } from '../util/uri-converter';
import { globals } from '../../globals';

/* This class models how a patterns can be reconstructed from the SPARQL queries. */
export class PatternInstance {
    uri: string;
    type: string;
    sectionProperties: Map<string, string[]>;

    constructor(uri: string = null, sectionProperties: Map<string, string[]> = null, type: string = null) {
        this.uri = uri;
        this.sectionProperties = sectionProperties;
        this.type = type;
    }


    addProperty(property: string, value: string): PatternInstance {
        this.sectionProperties.set(property, this.sectionProperties.has(property) ? this.sectionProperties.get(property).concat(value) : [value]);
        return this;
    }

    toPattern(plIri: string): Pattern {
        const nameKey = UriConverter.getFileName(plIri) + '#hasName';

        let name = '';
        if (this.sectionProperties.has(nameKey)) {
            name = this.sectionProperties.get(nameKey).join('');
        } else if (this.sectionProperties.has(globals.urlPatternRepoOntology + '#hasName')) {
            name = this.sectionProperties.get(globals.urlPatternRepoOntology + '#hasName').join('');
        }


        return new Pattern('', this.uri, name, this.sectionProperties);
    }


}