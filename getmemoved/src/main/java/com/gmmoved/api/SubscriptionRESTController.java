package com.gmmoved.api;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import javax.mail.MessagingException;
import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gmmoved.model.Question;
import com.gmmoved.model.Subscription;
import com.gmmoved.model.SubscriptionRepository;

@RestController
public class SubscriptionRESTController {

	private SubscriptionRepository repo;
	private SendGmailEmail email;

	private ThreadPoolExecutor executor = new ThreadPoolExecutor(10, 1000, 1, TimeUnit.SECONDS,
			new LinkedBlockingQueue<Runnable>());

	@Autowired
	public SubscriptionRESTController(SubscriptionRepository repo, SendGmailEmail email) {
		this.repo = repo;
		this.email = email;
	}

	/**
	 * Registers a new user and send a response, usually, an email with survey link
	 * @param subscription
	 * @param request
	 * @return
	 */
	@PostMapping("/register")
	public ResponseEntity<SubscriptionDTO> register(@RequestBody SubscriptionDTO subscription,
			HttpServletRequest request) {

		try {
			Subscription s = repo.findByEmail(subscription.getEmail());
			if (s == null) {
				final Subscription persisted = new Subscription(subscription.getName(), subscription.getEmail());
				repo.save(persisted);
				sendResponse(subscription, buildEmailBody(subscription, request));
				return new ResponseEntity<SubscriptionDTO>(subscription, HttpStatus.OK);
			}
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<SubscriptionDTO>(HttpStatus.INTERNAL_SERVER_ERROR);
		}

		return new ResponseEntity<SubscriptionDTO>(HttpStatus.OK);
	}

	private String buildEmailBody(SubscriptionDTO subscription, HttpServletRequest request) {
		String url = request.getRequestURL().substring(0, request.getRequestURL().indexOf(request.getRequestURI()));
				
		return new StringBuffer("Thank you, ").append(subscription.getName()).append(" for subscribing.<br/>")
				.append("We are glad to say that soon enough we will bring you a lot of places where you should visit and maybe to live!<br/>")
				.append("We would like to know more about you and what do you expect from us. So you could answers these questions to help us improve our service.<br/>")
				.append(url + "/#/welcome?name=" + subscription.getName() + "&email="
						+ subscription.getEmail())
				.append("<br/><br/>Also you are welcome to contact us and ask any questions.<br/>").append("Best regards, <br/>")
				.append("Get Me Moved Team").toString();
	}

	/**
	 * Start editing a new survey
	 * Receives parameters because the request can come from email survey
	 * @param name
	 * @param email
	 * @return
	 */
	@GetMapping("/survey/new")
	public ResponseEntity<QuestionsSubmissionDTO> survey(@RequestParam String name, @RequestParam String email) {

		if (email != null) {
			Subscription subscription = repo.findByEmail(email);
			if (subscription == null) {
				return new ResponseEntity<QuestionsSubmissionDTO>(HttpStatus.FORBIDDEN);
			}
		}
		final ArrayList<QuestionDTO> questions = new ArrayList<>();
		questions.add(new QuestionDTO("What do you expect of Get Me Moved?", null));
		questions.add(new QuestionDTO("What would you pay for?", null));
		questions.add(new QuestionDTO("What do you really need?", null));

		final SubscriptionDTO subscription = new SubscriptionDTO(name, email, questions);
		QuestionsSubmissionDTO response = new QuestionsSubmissionDTO(subscription, questions);

		return new ResponseEntity<QuestionsSubmissionDTO>(response, HttpStatus.OK);
	}

	/**
	 * Add a new survey
	 * @param questions
	 * @return
	 */
	@PostMapping("/survey/submit")
	public ResponseEntity<QuestionsSubmissionDTO> surveySubmit(@RequestBody QuestionsSubmissionDTO questions) {

		try {
			SubscriptionDTO subs = questions.getSubscription();
			if (subs != null) {

				Subscription subscription = repo.findByEmail(subs.getEmail());
				if (subscription != null) {
					if (subscription.getQuestions() == null) {
						subscription.setQuestions(toQuestions(questions.getQuestions()));
						repo.save(subscription);
						return new ResponseEntity<QuestionsSubmissionDTO>(questions, HttpStatus.OK);
					}
				} else {
					return new ResponseEntity<QuestionsSubmissionDTO>(questions, HttpStatus.OK);
				}
			}

			return new ResponseEntity<QuestionsSubmissionDTO>(HttpStatus.NOT_FOUND);

		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<QuestionsSubmissionDTO>(HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * Query for survey from one user
	 * @param email
	 * @return
	 */
	@GetMapping("/questions/subscription")
	public ResponseEntity<List<QuestionDTO>> questionsByEmail(@RequestParam String email) {
		Subscription subs = repo.findByEmail(email);
		if (subs != null) {
			List<QuestionDTO> questionsTO = toQuestionsTO(subs.getQuestions());
			return new ResponseEntity<List<QuestionDTO>>(questionsTO, HttpStatus.OK);
		} else {
			return new ResponseEntity<List<QuestionDTO>>(HttpStatus.NOT_FOUND);
		}
	}

	/**
	 * Report with all surveys by users
	 * @return
	 */
	@GetMapping("/answers")
	public ResponseEntity<List<SubscriptionDTO>> answers() {
		List<Subscription> subs = repo.findAll();
		if (subs != null) {

			return new ResponseEntity<List<SubscriptionDTO>>(subs.stream().map(it -> {
				List<QuestionDTO> questionsTO = toQuestionsTO(it.getQuestions());
				return new SubscriptionDTO(it.getName(), it.getEmail(), questionsTO);
			}).collect(Collectors.toList()), HttpStatus.OK);

		} else {
			return new ResponseEntity<List<SubscriptionDTO>>(HttpStatus.NOT_FOUND);
		}
	}

	private List<QuestionDTO> toQuestionsTO(List<Question> questions) {
		if (questions != null) {
			return questions.stream().map(it -> new QuestionDTO(it.getQuestion(), it.getAnswer()))
					.collect(Collectors.toList());
		}
		return Collections.emptyList();
	}

	private List<Question> toQuestions(List<QuestionDTO> questions) {
		if (questions != null) {
			return questions.stream().map(it -> new Question(it.getQuestion(), it.getAnswer()))
					.collect(Collectors.toList());
		}
		return Collections.emptyList();
	}

	private void sendResponse(final SubscriptionDTO subscription, String body) {

		executor.execute(new Runnable() {
			@Override
			public void run() {
				try {
					email.send(subscription, body);
				} catch (MessagingException e) {
					e.printStackTrace();
				}
			}
		});

	}
}
