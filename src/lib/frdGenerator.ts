import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  AlignmentType,
  WidthType,
  BorderStyle,
  HeadingLevel,
} from 'docx';
import { saveAs } from 'file-saver';
import { Variable, ConditionDefinition, Hyperlink, CTAButton } from '../types/template';

interface FRDDocumentData {
  templateName: string;
  templateDescription: string;
  templateHtml: string;
  variables: Variable[];
  conditions: ConditionDefinition[];
  hyperlinks: Hyperlink[];
  ctaButtons: CTAButton[];
}

function stripHtmlTags(html: string): string {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
}

export async function generateFRDDocument(data: FRDDocumentData): Promise<void> {
  const {
    templateName,
    templateDescription,
    templateHtml,
    variables,
    conditions,
    hyperlinks,
    ctaButtons,
  } = data;

  const sections: Paragraph[] = [];

  sections.push(
    new Paragraph({
      text: 'Email Template FRD',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Template Name: ',
          bold: true,
        }),
        new TextRun({
          text: templateName,
        }),
      ],
      spacing: { after: 100 },
    })
  );

  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Description: ',
          bold: true,
        }),
        new TextRun({
          text: templateDescription || 'No description provided',
        }),
      ],
      spacing: { after: 400 },
    })
  );

  sections.push(
    new Paragraph({
      text: '1. Dynamic Variables',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 200 },
    })
  );

  if (variables.length === 0) {
    sections.push(
      new Paragraph({
        text: 'No variables detected in template',
        italics: true,
        spacing: { after: 300 },
      })
    );
  } else {
    const variableTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Variable', bold: true })],
                }),
              ],
              shading: { fill: 'D3D3D3' },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Description', bold: true })],
                }),
              ],
              shading: { fill: 'D3D3D3' },
            }),
          ],
        }),
        ...variables.map(
          (variable) =>
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      text: variable.name,
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      text: variable.description || '-',
                    }),
                  ],
                }),
              ],
            })
        ),
      ],
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      },
    });

    sections.push(
      new Paragraph({
        children: [],
        spacing: { after: 300 },
      })
    );
    sections.push(variableTable as any);
  }

  sections.push(
    new Paragraph({
      text: '2. Conditions',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    })
  );

  if (conditions.length === 0) {
    sections.push(
      new Paragraph({
        text: 'No conditions defined in template',
        italics: true,
        spacing: { after: 300 },
      })
    );
  } else {
    const conditionRows: TableRow[] = [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Condition Logic', bold: true })],
              }),
            ],
            shading: { fill: 'D3D3D3' },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Content to Display', bold: true })],
              }),
            ],
            shading: { fill: 'D3D3D3' },
          }),
        ],
      }),
    ];

    conditions.forEach((condition) => {
      const clauseText = condition.clauses
        .map((clause) => `${clause.variable} ${clause.operator} ${clause.value}`)
        .join(` ${condition.logicOperator} `);

      conditionRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: condition.name, bold: true }),
                    new TextRun({ text: '\n', break: 1 }),
                    new TextRun({ text: clauseText, italics: true }),
                  ],
                }),
              ],
              shading: { fill: 'E8F5E9' },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  text: condition.content || 'No content specified',
                }),
              ],
            }),
          ],
        })
      );

      if (condition.hasElse && condition.elseContent) {
        const negatedOperator = (op: string) => {
          const map: Record<string, string> = {
            '==': '!=',
            '!=': '==',
            '>': '<=',
            '<': '>=',
            '>=': '<',
            '<=': '>',
            'contains': 'notContains',
            'notContains': 'contains',
          };
          return map[op] || op;
        };

        const elseClauseText = condition.clauses
          .map((clause) => `${clause.variable} ${negatedOperator(clause.operator)} ${clause.value}`)
          .join(condition.logicOperator === 'AND' ? ' OR ' : ' AND ');

        conditionRows.push(
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: `${condition.name} (ELSE)`, bold: true }),
                      new TextRun({ text: '\n', break: 1 }),
                      new TextRun({ text: elseClauseText, italics: true }),
                    ],
                  }),
                ],
                shading: { fill: 'FFEBEE' },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    text: condition.elseContent,
                  }),
                ],
              }),
            ],
          })
        );
      }
    });

    const conditionTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: conditionRows,
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      },
    });

    sections.push(
      new Paragraph({
        children: [],
        spacing: { after: 300 },
      })
    );
    sections.push(conditionTable as any);
  }

  sections.push(
    new Paragraph({
      text: '3. Hyperlinks',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    })
  );

  if (hyperlinks.length === 0) {
    sections.push(
      new Paragraph({
        text: 'No hyperlinks added to template',
        italics: true,
        spacing: { after: 300 },
      })
    );
  } else {
    const hyperlinkTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Text', bold: true })],
                }),
              ],
              shading: { fill: 'D3D3D3' },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'URL', bold: true })],
                }),
              ],
              shading: { fill: 'D3D3D3' },
            }),
          ],
        }),
        ...hyperlinks.map(
          (link) =>
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      text: link.text,
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      text: link.url,
                    }),
                  ],
                }),
              ],
            })
        ),
      ],
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      },
    });

    sections.push(
      new Paragraph({
        children: [],
        spacing: { after: 300 },
      })
    );
    sections.push(hyperlinkTable as any);
  }

  sections.push(
    new Paragraph({
      text: '4. CTA Buttons',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    })
  );

  if (ctaButtons.length === 0) {
    sections.push(
      new Paragraph({
        text: 'No CTA buttons added to template',
        italics: true,
        spacing: { after: 300 },
      })
    );
  } else {
    const ctaTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Text', bold: true })],
                }),
              ],
              shading: { fill: 'D3D3D3' },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'URL', bold: true })],
                }),
              ],
              shading: { fill: 'D3D3D3' },
            }),
          ],
        }),
        ...ctaButtons.map(
          (button) =>
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      text: button.text,
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      text: button.url,
                    }),
                  ],
                }),
              ],
            })
        ),
      ],
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      },
    });

    sections.push(
      new Paragraph({
        children: [],
        spacing: { after: 300 },
      })
    );
    sections.push(ctaTable as any);
  }

  sections.push(
    new Paragraph({
      text: '5. Email Content',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    })
  );

  const plainTextContent = stripHtmlTags(templateHtml || 'No content yet');
  const contentLines = plainTextContent.split('\n').filter(line => line.trim() !== '');

  if (contentLines.length === 0) {
    sections.push(
      new Paragraph({
        text: 'No content yet',
        italics: true,
        spacing: { after: 300 },
      })
    );
  } else {
    contentLines.forEach((line) => {
      sections.push(
        new Paragraph({
          text: line.trim(),
          spacing: { after: 100 },
        })
      );
    });
  }

  const doc = new Document({
    sections: [
      {
        children: sections,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${templateName.replace(/\s+/g, '_')}_FRD.docx`;
  saveAs(blob, fileName);
}
