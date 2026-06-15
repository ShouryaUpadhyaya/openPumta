import { prisma } from './prismaClient.js';

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

async function migrate() {
  console.log('Starting migration...');
  const spaces = await prisma.space.findMany({
    include: {
      columns: {
        include: {
          blocks: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });

  for (const space of spaces) {
    if (!space.columns || space.columns.length === 0) continue;

    console.log(`Migrating space: ${space.name} (${space.columns.length} columns)`);

    // For each column, we create a text box. We'll tile them horizontally.
    for (let i = 0; i < space.columns.length; i++) {
      const column = space.columns[i];

      const content = [];

      // Column title as Heading 2
      content.push({
        id: generateId(),
        type: 'heading',
        props: { level: 2 },
        content: column.title || '',
      });

      for (const block of column.blocks) {
        let type;
        let props = {};

        switch (block.type) {
          case 'HEADING':
            type = 'heading';
            props = { level: 3 };
            break;
          case 'TODO':
            type = 'checkListItem';
            props = { checked: block.isCompleted };
            break;
          case 'DIVIDER':
            type = 'paragraph';
            break;
          default:
            type = 'paragraph';
        }

        content.push({
          id: generateId(),
          type,
          props,
          content: block.type === 'DIVIDER' ? '---' : block.content,
        });
      }

      // Base layout: width 350, spacing 20. So x = i * (350 + 20)
      const layout = {
        desktop: {
          x: i * 370,
          y: 0,
          width: 350,
          height: 400,
        },
        tablet: {
          x: i * 320,
          y: 0,
          width: 300,
          height: 400,
        },
        mobile: {
          x: 0,
          y: i * 420,
          width: '100%',
          height: 400,
        },
      };

      await prisma.textBox.create({
        data: {
          spaceId: space.id,
          content: content,
          layout: layout,
          deleted: column.deleted,
          createdAt: column.createdAt,
          updatedAt: column.updatedAt,
        },
      });
    }
  }

  console.log('Migration complete!');
  await prisma.$disconnect();
}

migrate().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
