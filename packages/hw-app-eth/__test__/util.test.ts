import { convertCompresskey } from '../src/util'


describe("test util", () => {
    it('should convert compress key', () => {
        const test = "02c6047f9441ed7d6d3045406e95c07cd85a4740fbeef1a57d3c531746dfe5f9cb";

        const uncompressed = convertCompresskey(test)

        expect(uncompressed).toBe("04c6047f9441ed7d6d3045406e95c07cd85a4740fbeef1a57d3c531746dfe5f9cbdb80c2dc5d693c326707552d742d4ebb4be002f2c09423bd64daa5970d53541a")
    })
})