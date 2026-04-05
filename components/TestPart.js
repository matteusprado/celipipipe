"use client";

import DropdownQuestion from "./DropdownQuestion";
import FillBlankPassage from "./FillBlankPassage";
import ParagraphMatch from "./ParagraphMatch";
import styles from "./TestPart.module.css";

export default function TestPart({ part, answers, onAnswerChange }) {
  const onChange = (id, value) => onAnswerChange(id, value);

  if (part.number === 1) {
    return (
      <div className={styles.grid}>
        <section className={`surface ${styles.col}`}>
          <h2 className="h2">{part.title}</h2>
          <p className="muted">{part.comprehensionIntro}</p>
          <div className="passage surface" style={{ marginTop: "0.75rem" }}>
            {part.passage}
          </div>
        </section>
        <section className={`surface ${styles.col}`}>
          <div className={styles.stack}>
            {part.comprehension.map((q) => (
              <DropdownQuestion
                key={q.id}
                id={q.id}
                prompt={q.prompt}
                options={q.options}
                value={answers[q.id]}
                onChange={onChange}
              />
            ))}
          </div>
          <hr className={styles.hr} />
          <p className="muted">{part.replyIntro}</p>
          <FillBlankPassage segments={part.replySegments} answers={answers} onChange={onChange} />
        </section>
      </div>
    );
  }

  if (part.number === 2) {
    return (
      <div className={styles.grid}>
        <section className={`surface ${styles.col}`}>
          <h2 className="h2">{part.title}</h2>
          <div className="muted">{part.diagramTitle}</div>
          <div className={styles.diagram}>
            {part.diagramItems.map((item) => (
              <div key={item.mode} className={styles.card}>
                <div className={styles.mode}>{item.mode}</div>
                <ul className={styles.list}>
                  {item.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <div className={styles.meta}>
                  <div>{item.price}</div>
                  <div>{item.duration}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className={`surface ${styles.col}`}>
          <p className="muted">{part.passageIntro}</p>
          <div className="passage" style={{ whiteSpace: "pre-wrap" }}>
            {part.emailHeader}
          </div>
          <FillBlankPassage segments={part.emailSegments} answers={answers} onChange={onChange} />
          <hr className={styles.hr} />
          <p className="muted">{part.comprehensionIntro}</p>
          <div className={styles.stack}>
            {part.comprehension.map((q) => (
              <DropdownQuestion
                key={q.id}
                id={q.id}
                prompt={q.prompt}
                options={q.options}
                value={answers[q.id]}
                onChange={onChange}
              />
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (part.number === 3) {
    return (
      <div className={styles.grid}>
        <section className={`surface ${styles.col}`}>
          <h2 className="h2">{part.title}</h2>
          <p className="muted">{part.passageIntro}</p>
          <div className={styles.paras}>
            {part.paragraphs.map((p) => (
              <div key={p.label} className={styles.para}>
                <div className={styles.paraLabel}>{p.label}.</div>
                <div className="passage">{p.text}</div>
              </div>
            ))}
            <div className={styles.para}>
              <div className={styles.paraLabel}>{part.notGivenLabel}.</div>
              <div className="passage">{part.notGivenNote}</div>
            </div>
          </div>
        </section>
        <section className={`surface ${styles.col}`}>
          <p className="muted">{part.matchIntro}</p>
          <div className={styles.stack}>
            {part.matches.map((m) => (
              <ParagraphMatch
                key={m.id}
                id={m.id}
                prompt={m.prompt}
                options={m.options}
                value={answers[m.id]}
                onChange={onChange}
              />
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (part.number === 4) {
    return (
      <div className={styles.grid}>
        <section className={`surface ${styles.col}`}>
          <h2 className="h2">{part.title}</h2>
          <p className="muted">{part.passageIntro}</p>
          <div className="passage surface" style={{ marginTop: "0.75rem" }}>
            {part.article}
          </div>
        </section>
        <section className={`surface ${styles.col}`}>
          <p className="muted">{part.viewIntro}</p>
          <div className={styles.stack}>
            {part.viewQuestions.map((q) => (
              <DropdownQuestion
                key={q.id}
                id={q.id}
                prompt={q.prompt}
                options={q.options}
                value={answers[q.id]}
                onChange={onChange}
              />
            ))}
          </div>
          <hr className={styles.hr} />
          <p className="muted">{part.commentIntro}</p>
          <FillBlankPassage segments={part.commentSegments} answers={answers} onChange={onChange} />
        </section>
      </div>
    );
  }

  return null;
}
