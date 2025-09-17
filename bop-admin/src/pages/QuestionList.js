import { useEffect, useState } from "react";
import {
    ListGroup,
    Button,
    ButtonGroup,
    Container,
    Modal,
    Row,
    Col
} from "react-bootstrap";
import { cosmic } from "../cosmic";
import LoadingButton from "../components/LoadingButton";

export default function QuestionList() {
    const [questions, setQuestions] = useState([]);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [idToDelete, setIdToDelete] = useState(null);

    const reloadQuestions = async () => {
        try {
            setQuestions(
                (await cosmic.objects.find({ type: "questions" })).objects
                    .map(raw => ({
                        id: raw.id,
                        title: raw.title,
                        date: raw.created_at
                    }))
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            );
        } catch (err) {
            if (err.status !== 404) {
                throw err;
            }
        }
    };

    useEffect(() => { reloadQuestions() }, []);

    const confirmDelete = id => {
        setIdToDelete(id);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirmed = async () => {
        if (idToDelete !== null) {
            try {
                await cosmic.objects.deleteOne(idToDelete);
            } catch (err) {
                console.error("Question deletion failed:", err);
                alert("Question deletion failed");
                return;
            }

            await reloadQuestions();
            setShowDeleteModal(false);
            setIdToDelete(null);
        }
    };

    return (
        <Container className="mt-4">
            <h3>Submitted Questions</h3>

            {questions.length === 0 && <p>No questions found.</p>}
            <ListGroup>
                {questions.map((question, index) => (
                    <ListGroup.Item key={index}>
                        <Row className="align-items-center">
                            <Col xs={2} className="text-muted small">{question.date.slice(0, 10)}</Col>
                            <Col xs={8}>{question.title}</Col>
                            <Col xs={2} className="text-end">
                                <ButtonGroup size="sm">
                                    <Button variant="outline-danger" onClick={() => confirmDelete(question.id)}>
                                        Delete
                                    </Button>
                                </ButtonGroup>
                            </Col>
                        </Row>
                    </ListGroup.Item>
                ))}
            </ListGroup>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete this question?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <LoadingButton variant="danger" text="Delete" onClick={handleDeleteConfirmed} />
                </Modal.Footer>
            </Modal>
        </Container>
    );
}