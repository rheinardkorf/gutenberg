import { deepEqual } from 'assert';
import { JSDOM } from 'jsdom';

const { window } = new JSDOM();
const { document } = window;

import { create, toString, merge, isEmpty, deleteCharacter, applyFormat } from '../rich-text-structure';

function createNode( HTML ) {
	document.body.innerHTML = HTML;
	return document.body.firstChild;
}

describe( 'createRichTextRecordFromDOM', () => {
	it( 'should extract text with formats', () => {
		const element = createNode( '<p>one <em>two 🍒</em> three</p>' );

		deepEqual( create( element ), {
			formats: [
				undefined,
				undefined,
				undefined,
				undefined,
				[ { type: 'em' } ],
				[ { type: 'em' } ],
				[ { type: 'em' } ],
				[ { type: 'em' } ],
				[ { type: 'em' } ],
				[ { type: 'em' } ],
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
			],
			text: 'one two 🍒 three',
		} );
	} );

	it( 'should extract text with formats', () => {
		const element = createNode( '<p>one <em>two 🍒</em> <a href="#"><img src=""><strong>three</strong></a><img src=""></p>' );

		deepEqual( create( element ), {
			formats: [
				undefined,
				undefined,
				undefined,
				undefined,
				[ { type: 'em' } ],
				[ { type: 'em' } ],
				[ { type: 'em' } ],
				[ { type: 'em' } ],
				[ { type: 'em' } ],
				[ { type: 'em' } ],
				undefined,
				[ { type: 'a', attributes: { href: '#' } }, { type: 'img', attributes: { src: '' }, object: true }, { type: 'strong' } ],
				[ { type: 'a', attributes: { href: '#' } }, { type: 'strong' } ],
				[ { type: 'a', attributes: { href: '#' } }, { type: 'strong' } ],
				[ { type: 'a', attributes: { href: '#' } }, { type: 'strong' } ],
				[ { type: 'a', attributes: { href: '#' } }, { type: 'strong' } ],
				[ { type: 'img', attributes: { src: '' }, object: true } ],
			],
			text: 'one two 🍒 three',
		} );
	} );

	it( 'should extract multiline text', () => {
		const element = createNode( '<div><p>one <em>two</em> three</p><p>test</p></div>' );

		deepEqual( create( element, 'p' ), [
			{
				formats: [
					undefined,
					undefined,
					undefined,
					undefined,
					[ { type: 'em' } ],
					[ { type: 'em' } ],
					[ { type: 'em' } ],
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
				],
				text: 'one two three',
			},
			{
				formats: [
					undefined,
					undefined,
					undefined,
					undefined,
				],
				text: 'test',
			},
		] );
	} );

	it( 'should extract recreate HTML 1', () => {
		const HTML = 'one <em>two 🍒</em> <a href="#"><img src=""><strong>three</strong></a><img src="">';

		deepEqual( toString( create( createNode( `<p>${ HTML }</p>` ) ) ), HTML );
	} );

	it( 'should extract recreate HTML 2', () => {
		const HTML = 'one <em>two 🍒</em> <a href="#">test <img src=""><strong>three</strong></a><img src="">';

		deepEqual( toString( create( createNode( `<p>${ HTML }</p>` ) ) ), HTML );
	} );

	it( 'should extract recreate HTML 3', () => {
		const HTML = '<img src="">';

		deepEqual( toString( create( createNode( `<p>${ HTML }</p>` ) ) ), HTML );
	} );

	it( 'should extract recreate HTML 4', () => {
		const HTML = '<img src="">';

		deepEqual( toString( create( createNode( `<p>${ HTML }</p>` ) ) ), HTML );
	} );

	it( 'should extract recreate HTML 5', () => {
		const HTML = '<em>two 🍒</em>';

		deepEqual( toString( create( createNode( `<p>${ HTML }</p>` ) ) ), HTML );
	} );

	it( 'should extract recreate HTML 6', () => {
		const HTML = '<em>If you want to learn more about how to build additional blocks, or if you are interested in helping with the project, head over to the <a href="https://github.com/WordPress/gutenberg">GitHub repository</a>.</em>';

		deepEqual( toString( create( createNode( `<p>${ HTML }</p>` ) ) ), HTML );
	} );

	const settings = {
		removeNodeMatch: ( node ) => node.getAttribute( 'data-mce-bogus' ) === 'all',
		unwrapNodeMatch: ( node ) => !! node.getAttribute( 'data-mce-bogus' ),
		removeAttributeMatch: ( attribute ) => attribute.indexOf( 'data-mce-' ) === 0,
		filterString: ( string ) => string.replace( '\uFEFF', '' ),
	};

	it( 'should skip bogus 1', () => {
		const HTML = '<br data-mce-bogus="true">';

		deepEqual( toString( create( createNode( `<p>${ HTML }</p>` ), false, settings ) ), '' );
	} );

	it( 'should skip bogus 2', () => {
		const HTML = '<strong data-mce-bogus="true"></strong>';

		deepEqual( toString( create( createNode( `<p>${ HTML }</p>` ), false, settings ) ), '' );
	} );

	it( 'should skip bogus 3', () => {
		const HTML = '<strong data-mce-bogus="true">test <em>test</em></strong>';

		deepEqual( toString( create( createNode( `<p>${ HTML }</p>` ), false, settings ) ), 'test <em>test</em>' );
	} );

	it( 'should skip bogus 4', () => {
		const HTML = '<strong data-mce-bogus="all">test</strong>';

		deepEqual( toString( create( createNode( `<p>${ HTML }</p>` ), false, settings ) ), '' );
	} );

	it( 'should skip bogus 5', () => {
		const HTML = '<strong data-mce-selected="inline-boundary">test&#65279;</strong>';

		deepEqual( toString( create( createNode( `<p>${ HTML }</p>` ), false, settings ) ), '<strong>test</strong>' );
	} );
} );

describe( 'merge', () => {
	it( 'should merge records', () => {
		const one = {
			formats: [
				undefined,
				undefined,
				[ { type: 'em' } ],
			],
			text: 'one',
		};
		const two = {
			formats: [
				[ { type: 'em' } ],
				undefined,
				undefined,
			],
			text: 'two',
		};
		const three = {
			formats: [
				undefined,
				undefined,
				[ { type: 'em' } ],
				[ { type: 'em' } ],
				undefined,
				undefined,
			],
			text: 'onetwo',
		};

		const merged = merge( one, two );

		expect( merged ).not.toBe( one );
		expect( merged ).toEqual( three );
	} );

	it( 'should merge multiline records', () => {
		const one = [ {
			formats: [
				undefined,
				undefined,
				[ { type: 'em' } ],
			],
			text: 'one',
		} ];
		const two = [ {
			formats: [
				undefined,
				undefined,
				[ { type: 'em' } ],
			],
			text: 'two',
		} ];

		const merged = merge( one, two );

		expect( merged ).not.toBe( one );
		expect( merged ).toEqual( [ ...one, ...two ] );
	} );
} );

describe( 'isEmpty', () => {
	const emptyRecord = {
		formats: [],
		text: '',
	};

	it( 'should return true', () => {
		const one = emptyRecord;
		const two = [ emptyRecord ];
		const three = [];

		expect( isEmpty( one ) ).toBe( true );
		expect( isEmpty( two ) ).toBe( true );
		expect( isEmpty( three ) ).toBe( true );
	} );

	it( 'should return false', () => {
		const one = {
			formats: [],
			text: 'test',
		};
		const two = {
			formats: [
				[ { type: 'image' } ],
			],
			text: '',
		};
		const three = [ emptyRecord, one ];
		const four = [ one ];

		expect( isEmpty( one ) ).toBe( false );
		expect( isEmpty( two ) ).toBe( false );
		expect( isEmpty( three ) ).toBe( false );
		expect( isEmpty( four ) ).toBe( false );
	} );
} );

describe( 'deleteCharacter', () => {
	it( 'should return true', () => {
		const record = {
			formats: [
				undefined,
				undefined,
				undefined,
				undefined,
				[ { type: 'em' } ],
				[ { type: 'em' } ],
				[ { type: 'em' } ],
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
			],
			text: 'one two three',
		};

		const expected = {
			formats: [
				undefined,
				undefined,
				undefined,
				undefined,
				[ { type: 'em' } ],
				[ { type: 'em' } ],
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
			],
			text: 'one to three',
		};

		expect( deleteCharacter( record, 5 ) ).toEqual( expected );
	} );
} );

describe( 'applyFormat', () => {
	it( 'should apply format', () => {
		const record = {
			formats: [
				undefined,
				undefined,
				undefined,
				undefined,
				[ { type: 'em' } ],
				[ { type: 'em' } ],
				[ { type: 'em' } ],
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
			],
			text: 'one two three',
		};

		const expected = {
			formats: [
				undefined,
				undefined,
				undefined,
				[ { type: 'strong' } ],
				[ { type: 'em' }, { type: 'strong' } ],
				[ { type: 'em' }, { type: 'strong' } ],
				[ { type: 'em' } ],
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
			],
			text: 'one two three',
		};

		expect( applyFormat( record, 3, 5, { type: 'strong' } ) ).toEqual( expected );
	} );
} );
