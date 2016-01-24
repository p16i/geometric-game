




'use strict';
var assert = require('assert');
var fs = require('fs');
var geo = fs.readFileSync('./app/scripts/lib/Geo.js','utf-8');
var myCode = fs.readFileSync('./app/scripts/lib/DCEL.js','utf-8');

eval.call(null,geo);
eval.call(null,myCode);

describe('Edge', function(){
    describe('check same edge', function(){
        it('normal case', function(){
            var prev = new Edge( new Vertex(-10,-10) );
            var e1   = new Edge( new Vertex(0,0) );
            var e2   = new Edge( new Vertex(0,0) );
            e1.prev = prev;
            e2.prev = prev;
            assert.ok( e1.isSameEdge(e2) );
        });

        it('incorrect case', function(){
            var prev = new Edge( new Vertex(-10,-10) );
            var e1   = new Edge( new Vertex(0,0) );
            var e2   = new Edge( new Vertex(2,0) );
            e1.prev = prev;
            e2.prev = prev;
            assert.ok( !e1.isSameEdge(e2) );
        });
    });

    describe('intersect with line', function(){
        var e;
        beforeEach(function(){
            e = newEdge(0,0, 5,5);
        });
        it('intersect', function(){
            var v = e.intersectWithLine(
                new Line( 1, 0, new Point( 0, 2 ) )
            );
            assert.deepEqual( v.coordinate, {x: 2, y: 2});
        });
    });
});

describe('Face', function () {
    var face;

    beforeEach(function() {
        face = new Face();
        face.initWithBoundary( new Point( -10,-10 ), new Point(10,10 ) );
    });

    it('Construct Face',function(){

        var incEdges = face.getIncidentEdges(function( obj ){
            return { target: obj.target.coordinate };
        });


        assert.deepEqual( incEdges,
            [
                { target: { x: -10, y: -10 }},
                { target: { x: 10, y: -10  }},
                { target: { x: 10, y: 10   }},
                { target: { x: -10, y: 10  }}
            ],
            "Correct edges"
        );

        var vertices = face.getVertices( function(obj) {
            return {
                x: obj.coordinate.x,
                y: obj.coordinate.y,
                outGoingEdges: obj.outGoingEdges.length
            };
        });

        assert.deepEqual( vertices,
            [
                { x: -10, y: -10, outGoingEdges: 2 },
                { x: 10, y: -10, outGoingEdges: 2 },
                { x: 10, y: 10, outGoingEdges: 2 },
                { x: -10, y: 10, outGoingEdges: 2 }
            ],
            "Correct vertices"
        );
    });
    describe("Check Intersect with line", function(){
        it("Intersect", function(){
            var l = new Line(1,1, new Point(0,0) );
        });

        it("Miss", function(){
        });
    });
});

describe("DCEL", function(){
    it("Add vertex", function(){
        var f  =  new Face();
        var v1 = new Vertex(-10,-10);
        var v2 = new Vertex(0,0);
        var v3 = new Vertex(10,10);

        var h     = new Edge( v2 );
        v2.outGoingEdges.push(h);
        var hTwin = new Edge( v1 );
        var hNext = new Edge( v3 );

        h.face     = f;
        hNext.face = f;

        h.twin    = hTwin;
        h.next    = hNext;

        var dcel = new DCEL(h);
        var newVertex = new Vertex( -5, 5 );

        dcel.addVertexAt( newVertex, h );
        assert.deepEqual( newVertex.outGoingEdges[0].next , hNext );
        assert.deepEqual( h.next, newVertex.outGoingEdges[0].twin );
        assert.deepEqual( h.next.target , newVertex );
        assert.deepEqual( h.next.twin , newVertex.outGoingEdges[0] );
        assert.deepEqual( newVertex.outGoingEdges[0].target, v2 );
        assert.deepEqual( v2.outGoingEdges.length, 2 );

        assert.deepEqual( h.next.face, f );
        assert.deepEqual( newVertex.outGoingEdges[0].face, f );

    });
});

describe("DCEL", function() {
	it("Split Face", function(){
		var v1 = new Vertex(-10, -10);
		var v2 = new Vertex(-5, -10);
		var v3 = new Vertex(10, 0);
		var v4 = new Vertex(5, 5);
		var v5 = new Vertex(0, 5);
		var v6 = new Vertex(-10, 0);

		var h1 = new Edge(v1);
		var h2 = new Edge(v2);
		var h3 = new Edge(v3);
		var h4 = new Edge(v4);
		var h5 = new Edge(v5);
		var h6 = new Edge(v6);

		h1.next = h2;
		h2.next = h3;
		h3.next = h4;
		h4.next = h5;
		h5.next = h6;
		h6.next = h1;

		v6.outGoingEdges.push(h1);
		v1.outGoingEdges.push(h2);
		v2.outGoingEdges.push(h3);
		v3.outGoingEdges.push(h4);
		v4.outGoingEdges.push(h5);
		v5.outGoingEdges.push(h6);

		var h1Twin = new Edge(v6);
		var h2Twin = new Edge(v1);
		var h3Twin = new Edge(v2);
		var h4Twin = new Edge(v3);
		var h5Twin = new Edge(v4);
		var h6Twin = new Edge(v5);

		h1Twin.next = h6Twin; 
		h2Twin.next = h1Twin;
		h3Twin.next = h2Twin;
		h4Twin.next = h3Twin;
		h5Twin.next = h4Twin;
		h6Twin.next = h5Twin;


		h1.twin = h1Twin;
		h2.twin = h2Twin;
		h3.twin = h3Twin;
		h4.twin = h4Twin;
		h5.twin = h5Twin;
		h6.twin = h6Twin;

		var f = new Face(h1);

		h1.face = f;
		h2.face = f;
		h3.face = f;
		h4.face = f;
		h5.face = f;
		h6.face = f;

        var dcel = new DCEL(h1);
		dcel.splitFace(h1, v4);

        assert.deepEqual( v1.outGoingEdges.length, 2);
        assert.deepEqual( v1.outGoingEdges[1].target, v4);
        assert.deepEqual( v4.outGoingEdges.length, 2);
        assert.deepEqual( v4.outGoingEdges[1].target, v1);
        assert.deepEqual( v1.outGoingEdges[1].face.halfedge, v1.outGoingEdges[1]);
        assert.notDeepEqual( v1.outGoingEdges[1].face, f);
        assert.deepEqual( v4.outGoingEdges[1].face.halfedge, v4.outGoingEdges[1]);
        assert.notDeepEqual( v4.outGoingEdges[1].face, f);
        assert.deepEqual( h2.face, v4.outGoingEdges[1].face);
        assert.deepEqual( h3.face, v4.outGoingEdges[1].face);
        assert.deepEqual( h4.face, v4.outGoingEdges[1].face);
        assert.deepEqual( h5.face, v1.outGoingEdges[1].face);
        assert.deepEqual( h6.face, v1.outGoingEdges[1].face);
        assert.deepEqual( h1.face, v1.outGoingEdges[1].face);
	});
});

function newEdge( x1,y1, x2,y2 ) {

    var v1 = new Vertex( x1,y1 );
    var v2 = new Vertex( x2, y2 );

    var e = new Edge( v2 );
    var ePrev = new Edge( v1  );
    e.prev = ePrev;
    return e;
}
