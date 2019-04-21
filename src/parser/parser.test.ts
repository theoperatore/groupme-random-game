import { Parser } from './';

const noop = () => Promise.resolve({ bot_id: '', text: '' });

test('Can format help text', () => {
  const parser = new Parser();
  parser.setCommand('help', 'should format the help text', noop);

  expect(parser.formatCommands()).toBe(`should format the help text\n`);
});

test('Gives back the correct command', () => {
  const parser = new Parser();
  parser.setCommand('help', 'should format the help text', noop);
  parser.setCommand('whoami', 'tells me who i am', () =>
    Promise.resolve({ bot_id: '', text: 'this text' })
  );

  expect(parser.parse('#help')).toBe(noop);
});

test('Handles multi words correctly', () => {
  const parser = new Parser();
  parser.setCommand('dnd', 'a thing', noop);

  expect(parser.parse('#dnd a wraith')).toBe(noop);
});
