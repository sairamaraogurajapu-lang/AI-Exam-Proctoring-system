import React, {
  useState,
  useEffect,
  useRef,
  useCallback
} from 'react';

import {
  useNavigate,
  useParams
} from 'react-router-dom';

import Webcam from 'react-webcam';

import {
  FiMic,
  FiMicOff,
  FiClock,
  FiSend,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiList,
  FiVideo
} from 'react-icons/fi';

import { motion, AnimatePresence } from 'framer-motion';

import toast from 'react-hot-toast';

const ExamPage = () => {
  const { examId } = useParams();

  const navigate = useNavigate();

  // ======================================================
  // STATES
  // ======================================================

  const [exam, setExam] = useState(null);

  const [questions, setQuestions] = useState([]);

  const [answers, setAnswers] = useState({});

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [showSubmitModal, setShowSubmitModal] =
    useState(false);

  const [timeLeft, setTimeLeft] = useState(0);

  const [cameraAllowed, setCameraAllowed] =
    useState(false);

  const [cameraError, setCameraError] =
    useState(null);

  const [cameraModalOpen, setCameraModalOpen] =
    useState(false);

  const [microphoneAllowed, setMicrophoneAllowed] =
    useState(false);

  const [micMuted, setMicMuted] =
    useState(false);

  const [mediaStream, setMediaStream] =
    useState(null);

  const [showNavPanel, setShowNavPanel] =
    useState(true);

  const [autoSaveStatus, setAutoSaveStatus] =
    useState('saved');

  // ======================================================
  // REFS
  // ======================================================

  const webcamRef = useRef(null);

  const timerRef = useRef(null);

  const autoSaveRef = useRef(null);

  // ======================================================
  // CONSTANTS
  // ======================================================

  const AUTO_SAVE_INTERVAL = 30000;

  // ======================================================
  // AUTH CHECK
  // ======================================================

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('Please login first');

      navigate('/login');
    }
  }, [navigate]);

  // ======================================================
  // CAMERA + MICROPHONE
  // ======================================================

  const requestCameraPermission =
    useCallback(async () => {
      try {
        setCameraError(null);

        if (
          !navigator.mediaDevices ||
          !navigator.mediaDevices.getUserMedia
        ) {
          setCameraAllowed(false);
          setCameraModalOpen(true);
          setMicrophoneAllowed(false);
          setMicMuted(false);
          const msg = 'Browser not supported for camera.';
          setCameraError(msg);
          toast.error(msg);
          return false;
        }

        // Stop previous stream tracks (if any) before re-requesting
        if (mediaStream) {
          mediaStream
            .getTracks()
            .forEach(track => track.stop());
        }

        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: true,
              audio: false
            }
          );

        setMediaStream(stream);
        setCameraAllowed(true);
        setCameraModalOpen(false);

        // Mic will be requested only after explicit user action
        setMicrophoneAllowed(false);
        setMicMuted(false);

        toast.success('Camera Enabled');
        return true;
      } catch (error) {
        console.error('Camera Media Error:', error);

        setCameraAllowed(false);
        setMicrophoneAllowed(false);
        setMicMuted(false);
        setCameraModalOpen(true);

        // Browser blocked permissions / NotAllowedError / NotFoundError
        const name = error?.name;
        let msg = 'Camera access is required to attend the exam.';

        if (name === 'NotAllowedError' || name === 'SecurityError') {
          msg = 'Camera permission was denied. Please enable camera access to continue.';
        } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
          msg = 'No camera device found. Please connect a camera and try again.';
        } else if (name === 'NotReadableError' || name === 'TrackStartError') {
          msg = 'Unable to access the camera. It may be in use by another app.';
        } else if (name === 'OverconstrainedError') {
          msg = 'Requested camera constraints cannot be satisfied. Try a different camera.';
        } else if (error?.message) {
          msg = error.message;
        }

        setCameraError(msg);
        toast.error(msg);
        return false;
      }
    }, [mediaStream]);

  const requestMicrophonePermission =
    useCallback(async () => {
      try {
        if (
          !navigator.mediaDevices ||
          !navigator.mediaDevices.getUserMedia
        ) {
          toast.error(
            'Browser not supported'
          );
          return false;
        }

        // If we already have a stream, request audio only and merge tracks.
        // Many browsers will prompt again only when audio track is requested.
        const audioStream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: false,
              audio: true
            }
          );

        const audioTrack =
          audioStream.getAudioTracks()[0];

        if (!audioTrack) {
          toast.error(
            'Microphone not available'
          );
          return false;
        }

        setMicrophoneAllowed(true);
        setMicMuted(false);

        toast.success(
          'Microphone Enabled'
        );

        // Attach audio track to existing stream if possible
        setMediaStream(prevStream => {
          if (!prevStream) {
            // If camera stream wasn't created yet, use audio stream
            return audioStream;
          }

          // Add audio track to existing stream
          prevStream.addTrack(audioTrack);

          // Stop the temporary audioStream tracks except the audioTrack
          audioStream.getTracks().forEach(t => {
            if (t !== audioTrack) t.stop();
          });

          return prevStream;
        });

        return true;
      } catch (error) {
        console.error(
          'Microphone Media Error:',
          error
        );

        toast.error(
          'Please allow microphone permissions'
        );

        setMicrophoneAllowed(false);
        setMicMuted(false);
        return false;
      }
    }, []);


  // ======================================================
  // MOCK EXAM DATA
  // ======================================================

  const getMockExamData = useCallback(() => {
    return {
      title: 'Computer Science Exam',

      duration_minutes: 60,

      questions: [
        {
          id: 1,
          text: 'What does CPU stand for?',
          options: [
            'Central Processing Unit',
            'Computer Processing Unit',
            'Control Program Unit',
            'Central Program Unit'
          ],
          correct_answer:
            'Central Processing Unit',
          marks: 10
        },

        {
          id: 2,
          text: 'Which language is used in React?',
          options: [
            'Python',
            'Java',
            'JavaScript',
            'C++'
          ],
          correct_answer:
            'JavaScript',
          marks: 10
        },

        {
          id: 3,
          text: 'What does RAM stand for?',
          options: [
            'Random Access Memory',
            'Read Access Memory',
            'Run Access Memory',
            'Random Allocate Memory'
          ],
          correct_answer:
            'Random Access Memory',
          marks: 10
        },

        {
          id: 4,
          text: 'Who developed React?',
          options: [
            'Google',
            'Facebook',
            'Amazon',
            'Microsoft'
          ],
          correct_answer:
            'Facebook',
          marks: 10
        },

        {
          id: 5,
          text: 'Which hook manages state?',
          options: [
            'useEffect',
            'useState',
            'useRef',
            'useMemo'
          ],
          correct_answer:
            'useState',
          marks: 10
        }
      ]
    };
  }, []);

  // ======================================================
  // FETCH EXAM
  // ======================================================

  const fetchExamData = useCallback(
    async () => {
      try {
        setLoading(true);

        const examData =
          getMockExamData();

        setExam({
          title: examData.title,
          duration_minutes:
            examData.duration_minutes
        });

        setQuestions(
          examData.questions
        );

        setTimeLeft(
          examData.duration_minutes * 60
        );

        // Load saved answers

        const savedAnswers =
          localStorage.getItem(
            `exam_${examId}_answers`
          );

        if (savedAnswers) {
          setAnswers(
            JSON.parse(savedAnswers)
          );
        }

        // CAMERA (request only video on load)
        const cameraGranted =
          await requestCameraPermission();

        if (cameraGranted) {
          toast.success('Exam Loaded Successfully');
        }
      } catch (error) {
        console.error(error);

        toast.error(
          'Failed to load exam'
        );
      } finally {
        setLoading(false);
      }
    },
    [
      examId,
      getMockExamData,
      requestCameraPermission
    ]
  );

  // ======================================================
  // LOAD EXAM
  // ======================================================

  useEffect(() => {
    fetchExamData();

    return () => {
      if (timerRef.current) {
        clearInterval(
          timerRef.current
        );
      }

      if (autoSaveRef.current) {
        clearInterval(
          autoSaveRef.current
        );
      }

      if (mediaStream) {
        mediaStream
          .getTracks()
          .forEach(track =>
            track.stop()
          );
      }
    };
  }, [fetchExamData, mediaStream]);

  // ======================================================
  // TIMER
  // ======================================================

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(
      () => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(
              timerRef.current
            );

            toast.success(
              'Time Completed'
            );

            setShowSubmitModal(
              true
            );

            return 0;
          }

          return prev - 1;
        });
      },
      1000
    );
  }, []);

  // ======================================================
  // START TIMER
  // ======================================================

  useEffect(() => {
    if (
      !loading &&
      questions.length > 0
    ) {
      startTimer();

      autoSaveRef.current =
        setInterval(() => {
          if (
            Object.keys(answers)
              .length > 0
          ) {
            localStorage.setItem(
              `exam_${examId}_answers`,
              JSON.stringify(
                answers
              )
            );

            setAutoSaveStatus(
              'saved'
            );
          }
        }, AUTO_SAVE_INTERVAL);
    }

    return () => {
      if (autoSaveRef.current) {
        clearInterval(
          autoSaveRef.current
        );
      }
    };
  }, [
    loading,
    questions,
    answers,
    examId,
    startTimer
  ]);

  // ======================================================
  // ANSWERS
  // ======================================================

  const handleAnswer = (
    questionId,
    answer
  ) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));

    setAutoSaveStatus(
      'saved'
    );
  };

  // ======================================================
  // MICROPHONE TOGGLE
  // ======================================================

  const toggleMicrophone = async () => {
    // If microphone was never granted, request it on user gesture
    if (!microphoneAllowed) {
      const granted = await requestMicrophonePermission();
      if (!granted) return;
    }

    if (!mediaStream) return;

    const audioTracks =
      mediaStream.getAudioTracks();

    audioTracks.forEach(track => {
      track.enabled = micMuted;
    });

    setMicMuted(!micMuted);

    toast.success(
      micMuted
        ? 'Microphone Unmuted'
        : 'Microphone Muted'
    );
  };


  // ======================================================
  // CALCULATE SCORE
  // ======================================================

  const calculateScore = () => {
    let score = 0;

    questions.forEach(question => {
      if (
        answers[question.id] ===
        question.correct_answer
      ) {
        score += question.marks || 1;
      }
    });

    return score;
  };

  // ======================================================
  // SUBMIT EXAM
  // ======================================================

  const confirmSubmit = async () => {
    try {
      setSubmitting(true);

      const totalMarks =
        questions.reduce(
          (sum, q) =>
            sum + (q.marks || 1),
          0
        );

      const obtainedScore =
        calculateScore();

      const percentage =
        (obtainedScore /
          totalMarks) *
        100;

      const completedExams =
        JSON.parse(
          localStorage.getItem(
            'completedExams'
          ) || '[]'
        );

      completedExams.push({
        id: parseInt(examId),
        completedAt:
          new Date().toISOString(),
        score: obtainedScore,
        totalMarks,
        percentage
      });

      localStorage.setItem(
        'completedExams',
        JSON.stringify(
          completedExams
        )
      );

      localStorage.removeItem(
        `exam_${examId}_answers`
      );

      toast.success(
        `Exam Submitted Successfully`
      );

      navigate(
        '/student/dashboard'
      );
    } catch (error) {
      console.error(error);

      toast.error(
        'Failed to submit exam'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center bg-gradient-to-br from-purple-600 to-blue-600 text-white text-2xl font-bold">
        Loading Exam...
      </div>
    );
  }

  // ======================================================
  // MAIN UI
  // ======================================================

  const answeredCount =
    Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}

      <div className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-purple-700">
            {exam?.title}
          </h1>

          <div className="text-2xl font-bold text-gray-700">
            <FiClock className="inline mr-2" />

            {Math.floor(
              timeLeft / 60
            )}
            :
            {String(
              timeLeft % 60
            ).padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* BODY */}

      <div className="max-w-7xl mx-auto p-4 grid lg:grid-cols-[1fr_320px] gap-6">
        {/* LEFT */}

        <div>
          {/* PROGRESS */}

          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span>
                {answeredCount}/
                {questions.length}{' '}
                Answered
              </span>

              <span>
                {autoSaveStatus ===
                  'saved' && (
                  <FiCheckCircle className="text-green-500" />
                )}
              </span>
            </div>

            <div className="h-2 bg-gray-300 rounded-full">
              <div
                className="h-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
                style={{
                  width: `${
                    (answeredCount /
                      questions.length) *
                    100
                  }%`
                }}
              />
            </div>
          </div>

          {/* QUESTION */}

          <motion.div
            key={currentQuestion}
            initial={{
              opacity: 0,
              x: 30
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            className="bg-white rounded-2xl shadow-lg p-8 disabled:opacity-50"
            aria-disabled={cameraModalOpen}
          >
            <p className="text-purple-600 font-semibold mb-2">
              Question{' '}
              {currentQuestion +
                1}{' '}
              of{' '}
              {questions.length}
            </p>

            <h2 className="text-2xl font-bold mb-6">
              {
                questions[
                  currentQuestion
                ]?.text
              }
            </h2>

            <div className="space-y-4">
              {questions[
                currentQuestion
              ]?.options.map(
                (
                  option,
                  idx
                ) => (
                  <label
                    key={idx}
                    className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      answers[
                        questions[
                          currentQuestion
                        ]?.id
                      ] === option
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200'
                    }`}
                      disabled={cameraModalOpen}
                      style={cameraModalOpen ? { pointerEvents: 'none' } : undefined}
                  >
                    <input
                      type="radio"
                      checked={
                        answers[
                          questions[
                            currentQuestion
                          ]?.id
                        ] === option
                      }
                      onChange={() =>
                        handleAnswer(
                          questions[
                            currentQuestion
                          ]?.id,
                          option
                        )
                      }
                    />

                    <span>
                      {option}
                    </span>
                  </label>
                )
              )}
            </div>

            {/* NAVIGATION */}

            <div className="flex justify-between mt-8">
              <button
                onClick={() =>
                  setCurrentQuestion(
                    prev =>
                      Math.max(
                        prev - 1,
                        0
                      )
                  )
                }
                disabled={
                  currentQuestion ===
                  0 || cameraModalOpen
                }
                className="px-5 py-2 bg-gray-300 rounded-lg disabled:opacity-50"
              >
                <FiChevronLeft className="inline mr-2" />

                Previous
              </button>

              <button
                onClick={() =>
                  setCurrentQuestion(
                    prev =>
                      Math.min(
                        prev + 1,
                        questions.length -
                          1
                      )
                  )
                }
                disabled={
                  currentQuestion ===
                  questions.length - 1 || cameraModalOpen
                }
                className="px-5 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50"
              >
                Next

                <FiChevronRight className="inline ml-2" />
              </button>
            </div>
          </motion.div>

          {/* SUBMIT */}

          <button
            onClick={() =>
              setShowSubmitModal(true)
            }
            disabled={
              submitting || !cameraAllowed
            }
            className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold disabled:opacity-50"
          >
            <FiSend className="inline mr-2" />

            Submit Exam
          </button>
        </div>

        {/* RIGHT */}

        <div className="space-y-6">
          {/* CAMERA */}

          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <FiVideo />

                Live Monitoring
              </h3>

              <div className="flex items-center gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />

                Recording
              </div>
            </div>

            <div className="rounded-xl overflow-hidden bg-black aspect-video relative">
              <Webcam
                ref={webcamRef}
                audio={microphoneAllowed}
                muted={true}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode:
                    'user'
                }}
                className="w-full h-full object-cover"
              />


              <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <FiEye />

                Examiner Watching
              </div>
            </div>

            {/* STATUS */}

            <div className="mt-4 flex justify-between text-sm text-gray-600">
              <span>
                Camera:{' '}
                {cameraAllowed
                  ? 'Active'
                  : 'Blocked'}
              </span>

              <span>
                Mic:{' '}
                {microphoneAllowed
                  ? micMuted
                    ? 'Muted'
                    : 'Active'
                  : 'Blocked'}
              </span>
            </div>

            {/* MIC BUTTON */}

            <button
              onClick={
                toggleMicrophone
              }
              className={`w-full mt-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                micMuted
                  ? 'bg-red-500'
                  : 'bg-green-500'
              } text-white`}
            >
              {micMuted ? (
                <FiMicOff />
              ) : (
                <FiMic />
              )}

              {micMuted
                ? 'Unmute Microphone'
                : 'Mute Microphone'}
            </button>
          </div>

          {/* QUESTION NAVIGATOR */}

          <div className="bg-white rounded-2xl shadow-lg p-4">
            <button
              onClick={() =>
                setShowNavPanel(
                  !showNavPanel
                )
              }
              className="w-full flex justify-between items-center mb-4"
            >
              <span className="font-bold">
                Question Navigator
              </span>

              <FiList />
            </button>

            <AnimatePresence>
              {showNavPanel && (
                <motion.div
                  initial={{
                    opacity: 0
                  }}
                  animate={{
                    opacity: 1
                  }}
                >
                  <div className="grid grid-cols-5 gap-2">
                    {questions.map(
                      (
                        q,
                        idx
                      ) => (
                        <button
                          key={q.id}
                          onClick={() =>
                            setCurrentQuestion(
                              idx
                            )
                          }
                          className={`w-10 h-10 rounded-lg font-bold ${
                            answers[
                              q.id
                            ]
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-300'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      )
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* CAMERA REQUIRED MODAL */}

      <AnimatePresence>
        {cameraModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                  <FiVideo size={20} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Camera access is required to attend the exam.
                  </h2>
                  <p className="text-sm text-gray-600">
                    {cameraError
                      ? cameraError
                      : 'Please allow camera permissions to continue.'}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={
                    () => requestCameraPermission()
                  }
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
                >
                  Enable Camera
                </button>

                <button
                  onClick={
                    () => navigate('/student/dashboard')
                  }
                  className="flex-1 py-3 border rounded-lg"
                >
                  Leave Exam
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUBMIT MODAL */}

      <AnimatePresence>
        {showSubmitModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
          >
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">
                Submit Exam?
              </h2>

              <p className="mb-6">
                You answered{' '}
                {answeredCount} out
                of{' '}
                {questions.length}{' '}
                questions.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() =>
                    setShowSubmitModal(false)
                  }
                  className="flex-1 py-3 border rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmSubmit}
                  disabled={!cameraAllowed}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg disabled:opacity-50"
                >
                  Submit
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExamPage;