# 리액트 훅 폼

## DevTools

리액트 훅 폼은 데브 툴을 가지고 있어서 form의 value, touched된 상태, dirty된 상태 등을 알 수 있다.

```cmd
npm install -D @hookform/devtools
```

위의 명령어로 DevTools를 설치하자.

```ts
import { DevTool } from "@hookform/devtools";

export default () => {
  const { register, control } = useForm();

  return (
    <>
      (...폼이 그려져 있음)
      <DevTool control={control} /> {/* set up the dev tool */}
    </>
  );
};
```

위와 같이 control을 전달해주면 해당 폼에 대해서 devtool이 실행된다.

## Form State와 리 렌더링

폼의 상태가 변할 때 rhf은 리렌더링을 할까? 정답은 **아니다** 이다.

```ts
let renderCount = 0;

export const YouTubeForm = () => {
  const form = useForm();
  const { register } = form;
  const { va } = register("id");

  renderCount++;
  return (
    <div>
      <h1>Youtube form ({renderCount / 2})</h1>
      <form>
        <label htmlFor="username">Username</label>
        <input type="text" id="username" {...register("username")} />
        <button>Submit</button>
      </form>
    </div>
  );
};
```

위와 같은 예시 코드가 있을 때 인풋창에 username을 적어도 renderCount는 계속 1이 되는 것을 알 수 있다.  
생각해보니 register가 리턴하는 값들에도 value는 없고, (name, onBlur, onChange, ref)만 있다. 일부러 value가 바뀔 시 리렌더링이 되지 않도록 value만 따로 조절하는 듯 하다.

## FormValidation

훅폼의 validation을 테스트하기 위해서 일단은 form 태그에 noValidate 속성을 주자.  
해당 속성을 주면 html validation이 작동하지 않는다.

```ts
<input
  type="text"
  id="username"
  {...register("username", { required: "USername is required" })}
/>
```

기본적으로 저렇게 객체를 주고, required, pattern 등을 통해서 validation이 가능하다.

```ts
const { formState } = form;
const { errors } = formState;
```

formState안에 errors 객체가 있는데 해당 객체 안에 에러들이 같이 담겨있다.

```js
<p className="error">{errors.username?.message}</p>
```

위와같이 에러 메시지 등에 접근이 가능하다.

> 모드에 따라서 언제 form의 validation을 할 지 정해지는데 기본값이 onSubmit이기 때문에 폼을 제출 할 때 error가 생긴다.
